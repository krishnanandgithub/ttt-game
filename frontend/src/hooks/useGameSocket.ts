import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type PlayerMark = 'X' | 'O';

export default function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [board, setBoard] = useState('---------');
  const [mark, setMark] = useState<PlayerMark | null>(null);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'playing' | 'finished'>('idle');
  const [nextTurn, setNextTurn] = useState<PlayerMark | null>(null);
  const [winner, setWinner] = useState<PlayerMark | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [opponent, setOpponent] = useState<{ username: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    function onApply(e: Event) {
      const d = (e as CustomEvent).detail as { username?: string } | undefined;
      if (d && d.username) setUsername(d.username);
    }
    window.addEventListener('ttt:applySettings', onApply as EventListener);
    return () => window.removeEventListener('ttt:applySettings', onApply as EventListener);
  }, []);

  function connect(username: string) {
    const url = ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:4000';
    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    try {
      const w = window as any;
      w.__TTT_SOCKET = socket;
    } catch (e) {}

    socket.on('start', (p: any) => {
      setGameId(p.gameId);
      setMark(p.mark);
      setStatus('playing');
      setBoard('---------');
      setOpponent(p.opponent || null);
      setNextTurn('X');
      setWinner(null);
      setWinningLine(null);
    });

    setUsername(username);

    socket.on('state', (s: any) => {
      setBoard(s.board);
      setStatus(s.status);
      setNextTurn(s.nextTurn || null);
      setWinner(s.winner ?? null);
      setWinningLine(s.winningLine ?? null);
    });

    socket.on('settings', (s: any) => {
      try {
        if (s && typeof window !== 'undefined') {
          if (s.mode) localStorage.setItem('ttt_mode', s.mode);
          if (s.palette) localStorage.setItem('ttt_palette', s.palette);
          window.dispatchEvent(new CustomEvent('ttt:applySettings', { detail: s }));
          if (s.username) {
            localStorage.setItem('ttt_username', s.username);
            setUsername(s.username);
          }
        }
      } catch (e) {}
    });

    socket.on('joined', (p: any) => {
      setStatus('waiting');
    });

    socket.on('opponentLeft', (p: any) => {
      setStatus('finished');
      setError(p && p.message ? p.message : 'Opponent left');
    });

    socket.on('error', (p: any) => {
      setError(p && p.message ? p.message : String(p));
    });

    socket.emit('join', { username });
  }

  function makeMove(index: number) {
    if (!socketRef.current || !gameId || !mark) return;
    socketRef.current.emit('move', { gameId, index, mark });
  }

  function leave() {
    if (!socketRef.current) return;
    socketRef.current.emit('leave');
    socketRef.current.disconnect();
    socketRef.current = null;
    setConnected(false);
    setGameId(null);
    setStatus('idle');
    setBoard('---------');
    setMark(null);
    setOpponent(null);
  }

  return {
    username,
    connected,
    gameId,
    board,
    mark,
    status,
    nextTurn,
    winner,
    winningLine,
    opponent,
    error,
    connect,
    makeMove,
    leave,
  };
}
