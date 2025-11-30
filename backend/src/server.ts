import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket as IOSocket } from 'socket.io';
import checkMove from './game/checkMove';
import { PrismaClient } from '@prisma/client';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true },
});

type PlayerMark = 'X' | 'O';

interface GameSocket extends IOSocket {
  username?: string;
  gameId?: string | null;
  mark?: PlayerMark;
}

const waitingQueue: GameSocket[] = [];
const games = new Map<string, any>();
let nextGameId = 1;

type UserSettings = {
  username: string;
  mode?: 'light' | 'dark';
  palette?: string;
};
const userSettings = new Map<string, UserSettings>();

// Prisma client for persistent storage (optional, falls back to in-memory)
const prisma = new PrismaClient();

async function getSettingsFromDb(username: string): Promise<UserSettings | null> {
  try {
    const u = await (prisma as any).user.findUnique({ where: { username } });
    if (!u) return null;
    return { username: u.username, mode: u.mode as any, palette: u.palette as any };
  } catch (e) {
    console.error('getSettingsFromDb error for', username, e);
    return null;
  }
}

async function upsertSettingsToDb(s: UserSettings) {
  try {
    await (prisma as any).user.upsert({
      where: { username: s.username },
      update: { mode: s.mode ?? undefined, palette: s.palette ?? undefined },
      create: { username: s.username, mode: s.mode ?? undefined, palette: s.palette ?? undefined },
    });
    console.log('upsertSettingsToDb success for', s.username);
  } catch (e) {
    console.error('upsertSettingsToDb error for', s.username, e);
  }
}

function createEmptyBoard() {
  return '---------';
}

function attemptMatch() {
  if (waitingQueue.length >= 2) {
    const a = waitingQueue.shift() as GameSocket;
    const b = waitingQueue.shift() as GameSocket;
    const gameId = String(nextGameId++);
    const board = createEmptyBoard();
    const game = {
      id: gameId,
      board,
      nextTurn: 'X',
      status: 'playing',
      players: { X: a, O: b },
    };
    games.set(gameId, game);
    a.gameId = gameId;
    a.mark = 'X';
    b.gameId = gameId;
    b.mark = 'O';
    console.log(`Matched players: ${a.username} (X) vs ${b.username} (O) -> game ${gameId}`);
    a.emit('start', { gameId, mark: 'X', opponent: { username: b.username } });
    b.emit('start', { gameId, mark: 'O', opponent: { username: a.username } });
    const aSettings = userSettings.get(a.username || '') || null;
    const bSettings = userSettings.get(b.username || '') || null;
    a.emit('settings', aSettings);
    b.emit('settings', bSettings);
    emitGameState(gameId);
  }
}

function emitGameState(gameId: string) {
  const game = games.get(gameId);
  if (!game) return;
  const payload = {
    gameId: game.id,
    board: game.board,
    nextTurn: game.nextTurn,
    status: game.status,
    winner: null,
    winningLine: null,
  };
  (['X', 'O'] as PlayerMark[]).forEach(mark => {
    const sock = game.players[mark] as GameSocket | undefined;
    if (sock && (sock as any).connected) {
      sock.emit('state', payload);
    }
  });
}

io.on('connection', socketRaw => {
  const socket = socketRaw as GameSocket;
  console.log('Socket connected:', socket.id);

  socket.on('join', async (payload: any) => {
    const username = payload && payload.username ? String(payload.username) : 'anon';
    console.log(`join received from ${socket.id} username=${username}`);
    socket.username = username;
    const dbSettings = await getSettingsFromDb(username);
    const settings = dbSettings || userSettings.get(username) || null;
    socket.emit('settings', settings);
    waitingQueue.push(socket);
    socket.emit('joined', { message: 'waiting' });
    attemptMatch();
  });

  socket.on('move', (payload: any) => {
    try {
      const { gameId, index, mark } = payload || {};
      const game = games.get(String(gameId));
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      const result = checkMove({
        board: game.board,
        index,
        mark,
        expectedNextTurn: game.nextTurn,
      });
      if (!result.valid) {
        socket.emit('error', { message: result.reason || 'invalid move' });
        return;
      }
      game.board = result.newBoard;
      game.nextTurn = result.nextTurn || null;
      if (result.winner) {
        game.status = 'finished';
      } else if (result.draw) {
        game.status = 'finished';
      }
      emitGameState(game.id);
    } catch (err) {
      socket.emit('error', { message: 'server error' });
    }
  });

  socket.on('saveSettings', async (payload: any) => {
    try {
      const username = (payload && payload.username) || socket.username || null;
      if (!username) return;
      const s: UserSettings = {
        username: username,
        mode: payload.mode,
        palette: payload.palette,
      };
      userSettings.set(username, s);
      socket.username = username;
      // persist to DB asynchronously
      upsertSettingsToDb(s);
      socket.emit('settings', s);
      socket.emit('settingsSaved', { ok: true });
    } catch (err) {
      socket.emit('error', { message: 'could not save settings' });
    }
  });

  socket.on('leave', (_payload: any) => {
    const gameId = socket.gameId;
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        (['X', 'O'] as PlayerMark[]).forEach(mark => {
          const s = game.players[mark] as GameSocket | undefined;
          if (s && s.id !== socket.id) {
            s.emit('opponentLeft', { message: 'Opponent left' });
            s.gameId = null;
          }
        });
        games.delete(gameId);
      }
    }
    const idx = waitingQueue.indexOf(socket);
    if (idx !== -1) waitingQueue.splice(idx, 1);
    socket.disconnect(true);
  });

  socket.on('disconnect', () => {
    const idx = waitingQueue.indexOf(socket);
    if (idx !== -1) waitingQueue.splice(idx, 1);
    const gameId = socket.gameId;
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        (['X', 'O'] as PlayerMark[]).forEach(mark => {
          const s = game.players[mark] as GameSocket | undefined;
          if (s && s.id !== socket.id && (s as any).connected) {
            s.emit('opponentLeft', { message: 'Opponent disconnected' });
          }
        });
        games.delete(gameId);
      }
    }
  });
});

function shutdown() {
  console.log('Shutting down server...');
  io.close();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.post('/settings', async (req, res) => {
  try {
    const { username, mode, palette } = req.body || {};
    if (!username) return res.status(400).json({ error: 'username required' });
    const s: UserSettings = { username, mode, palette };
    userSettings.set(username, s);
    // persist to DB if available
    await upsertSettingsToDb(s);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'server error' });
  }
});

app.get('/settings/:username', async (req, res) => {
  const username = String(req.params.username || '');
  try {
    const db = await getSettingsFromDb(username);
    const s = db || userSettings.get(username) || null;
    return res.json(s);
  } catch (err) {
    return res.status(500).json({ error: 'server error' });
  }
});
