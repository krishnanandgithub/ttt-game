# Tic-Tac-Toe Full-Stack Copilot Playbook (TypeScript + TSX)

> **Purpose:** This file is the _single source of truth_ for building a 1v1 multiplayer Tic-Tac-Toe web app with **Node.js + Express + Socket.IO + Prisma (Postgres)** and **React + Vite + TypeScript**.  
> Use it in **GitHub Copilot Chat** or as **comment prompts** inside files in VS Code.

---

## Table of contents

1. Goals & scope
2. Quick prerequisites
3. Project layout (monorepo)
4. Copilot prompts (ordered, copy/paste-ready)
   - 4.1 Project scaffold (monorepo)
   - 4.2 Backend server (Express + Socket.IO)
   - 4.3 Game logic module (`checkMove`) + tests
   - 4.4 Prisma schema + seed
   - 4.5 Frontend Vite React (TypeScript) scaffold
   - 4.6 Socket client hook (`useGameSocket`)
   - 4.7 Frontend Game page + integration
   - 4.8 Backend socket flow tests
   - 4.9 GitHub Actions CI
   - 4.10 Deployment notes & helper prompt
5. Commands & run sequence (local dev)
6. Environment variables & `.env.example`
7. Prisma & database steps
8. Game logic summary (rules & API)
9. Frontend responsibilities & hooks
10. Socket event contract (client ↔ server)
11. Testing strategy (unit, integration, e2e)
12. CI/CD: secrets & behavior
13. Deploy recommendations
14. Security & best practices checklist
15. Helpful Copilot follow-up prompts
16. Appendix: file headers & in-file prompts

---

## 1. Goals & scope

- Build a **multiplayer Tic-Tac-Toe (1v1) web app**:
  - Real-time using **WebSockets (Socket.IO)**
  - **Backend:** Node.js + Express + Socket.IO + Prisma (Postgres)
  - **Frontend:** React + Vite + **TypeScript** (TSX components)
  - **DB:** Supabase (or any Postgres)
  - **CI/CD:** GitHub Actions
  - **Hosting:**
    - Frontend: Vercel
    - Backend: Render (or similar)

- Deliverables in repo:
  - Working backend server
  - React client (TSX)
  - Prisma schema + migrations + seed
  - Tests (unit + integration skeleton)
  - CI workflows for PRs and builds
  - Deployment instructions

- **Rule:** Use this file as the single source of truth when prompting Copilot.

---

## 2. Quick prerequisites

- Node.js **18+**
- Git + GitHub repository
- Supabase account (Postgres) already set up
- Vercel account (frontend)
- Render (or similar) account (backend)
- VS Code with **GitHub Copilot** (and Copilot Chat) enabled
- Comfortable with **TypeScript** basics

---

## 3. Project layout (monorepo)

Target structure (Copilot will generate contents):

```txt
/tictactoe
  package.json        # root workspace
  /backend
    package.json
    README.md
    .env.example
    src/
      server.js
      game/
        checkMove.js
      routes/
    prisma/
      schema.prisma
      seed.js
    tests/
      checkMove.test.js
      socket.flow.test.js
  /frontend
    package.json
    tsconfig.json
    vite.config.ts
    README.md
    index.html
    src/
      main.tsx
      App.tsx
      pages/
        Lobby.tsx
        Game.tsx
      components/
        Board.tsx
      hooks/
        useGameSocket.ts
      types/
        game.ts
  .github/
    workflows/
      ci.yml
      deploy-frontend.yml   # optional
      deploy-backend.yml    # optional
  README.md
  DEPLOYMENT.md
  SECURITY.md
  dev-verify.sh            # optional sanity script
```

> Note: **All React components are `.tsx` files**, and the hook is `.ts`.

---

## 4. Copilot prompts (ordered, copy/paste-ready)

> **How to use:**
>
> 1. Open **Copilot Chat** in VS Code.
> 2. Paste one prompt at a time.
> 3. Let Copilot generate full files.
> 4. Review, tweak if needed, and save.

---

### 4.1 Project scaffold (monorepo)

Paste in Copilot Chat:

```text
Task: Create a monorepo scaffold for a Tic-Tac-Toe full-stack app with a TypeScript React frontend.

Goal:
- Set up a root workspace with "frontend" and "backend".
- Backend: plain Node/Express/Socket.IO JavaScript for now.
- Frontend: Vite + React + TypeScript (.tsx components).
- Provide minimal but runnable starter code for both.

Output:
- A tree-style file list.
- Full file contents for each of the following:

Files to generate:
- Root:
  - package.json (with workspaces: ["frontend", "backend"])
  - README.md (how to run backend and frontend)
- backend/:
  - package.json (Node 18, scripts: dev, start, test placeholder)
  - README.md
  - .env.example
  - src/server.ts (very minimal Express + Socket.IO server stub)
  - prisma/schema.prisma (empty placeholder or basic content)
- frontend/:
  - package.json (Vite + React + TypeScript setup: scripts dev/build/preview)
  - tsconfig.json
  - vite.config.ts
  - README.md
  - index.html
  - src/main.tsx
  - src/App.tsx
  - src/pages/Lobby.tsx
  - src/pages/Game.tsx (initial placeholder)
  - src/components/Board.tsx (initial placeholder)
  - src/hooks/useGameSocket.ts (empty placeholder hook)
  - src/types/game.ts (for any shared frontend types)

Constraints:
- Use Node 18+ in the engines field where relevant.
- Keep server and client as simple as possible but runnable.
- No secrets or real env values.
- Use comments (// TODO) where further implementation will be added.
- For frontend, base the tooling on a standard Vite React TypeScript template.

Return:
- The tree layout.
- The full contents of each file.
```

---

### 4.2 Backend: Express + Socket.IO server (`backend/src/server.ts`)

```text
Task: Implement backend/src/server.js as a complete Express + Socket.IO server.

Requirements:
- Use: express, http, socket.io, cors, dotenv.
- Read port from process.env.PORT or default to 4000.
- Expose GET /health that returns JSON: { status: "ok" }.
- Enable CORS (allow localhost:5173 during development).
- Configure Socket.IO on top of the HTTP server.

Socket events:
- 'join' with payload { username }:
  - Add the socket to an in-memory waiting queue.
  - Try to match players in pairs.
- 'move' with payload { gameId, index }:
  - For now, just broadcast to the other player in the same game as a placeholder.
  - Later this will use the checkMove logic and Prisma.
- 'leave' with an optional payload { gameId? }:
  - Remove the socket from the waiting queue or game.
  - Notify the opponent if they exist.

Matching:
- Implement a function attemptMatch() that:
  - Takes two waiting sockets when available.
  - Creates a simple in-memory game object with:
    - gameId (string or number),
    - initial board '---------' (9 empty cells),
    - nextTurn 'X'.
  - Assigns one socket mark 'X' and the other 'O'.
  - Emits a 'start' event to both sockets:
    - payload: { gameId, mark, opponent: { username } }.

State broadcasting:
- Add a helper emitGameState(gameId) that:
  - Looks up the game in memory.
  - Emits 'state' to both players with:
    { gameId, board, nextTurn, status, winner, winningLine }
  - For now, status can be 'playing' and winner/winningLine can be null.

Graceful shutdown:
- Listen for process signals (SIGINT, SIGTERM) and:
  - Close the HTTP server and Socket.IO server gracefully.
  - Log a shutdown message.

Comments / TODOs:
- Add clear TODO comments where:
  - Prisma DB persistence will be added for Player, Game, Move.
  - Game win detection and validation will use checkMove.js.
  - Proper error handling and logging will be improved.

Constraints:
- Keep everything in a single file: backend/src/server.ts for now.
- Write clean, commented code.
- Do not require prisma yet, just mention it in TODO comments.

Return:
- The full content of backend/src/server.js.
```

---

### 4.3 Game logic module (`checkMove`) + tests

```text
Task 1: Implement backend/src/game/checkMove.js as a pure game logic module.

Spec:
- Export a function: checkMove({ board, index, mark, expectedNextTurn }) where:
  - board: string of length 9, characters 'X', 'O', or '-' for empty.
  - index: integer between 0 and 8.
  - mark: 'X' or 'O'.
  - expectedNextTurn: optional 'X' or 'O'.
- Behavior:
  - Validate:
    - board length is 9.
    - index is within 0..8.
    - target square is currently empty ('-').
    - If expectedNextTurn is provided, mark must equal expectedNextTurn.
  - If invalid:
    - Return an object:
      { valid: false, newBoard: board, winner: null, draw: false, nextTurn: expectedNextTurn ?? null, reason: string }
  - If valid:
    - Apply the move:
      - Create newBoard with the mark placed at index.
    - Determine winner with these 8 winning lines:
      - rows: [0,1,2], [3,4,5], [6,7,8]
      - cols: [0,3,6], [1,4,7], [2,5,8]
      - diagonals: [0,4,8], [2,4,6]
    - Compute:
      - winner: 'X', 'O', or null.
      - draw: true if no winner and no '-' remaining.
      - nextTurn:
        - If game is finished (winner or draw), nextTurn can be null.
        - Else, 'X' if mark was 'O', and 'O' if mark was 'X'.
  - Return final object:
    { valid, newBoard, winner, draw, nextTurn, reason?: string }

- Keep this module completely pure: no DB, no sockets, no console.log.

Task 2: Create Jest tests in backend/tests/checkMove.test.js

Requirements:
- Use Jest test cases to cover:
  - A valid move on an empty board.
  - Invalid move: index out of range.
  - Invalid move: index occupied.
  - Invalid move: wrong expectedNextTurn.
  - X wins (e.g. first row).
  - O wins (e.g. a column or diagonal).
  - Draw situation: full board with no winner.
- Use descriptive test names.
- Make sure tests import the function from ../src/game/checkMove.

Return:
- Full content of backend/src/game/checkMove.js.
- Full content of backend/tests/checkMove.test.js.
- Suggest the "test" script for backend/package.json but do not modify it directly.
```

---

### 4.4 Prisma schema + seed (`backend/prisma/schema.prisma`, `seed.js`)

```text
Task: Implement Prisma models and a seed script for Tic-Tac-Toe.

File 1: backend/prisma/schema.prisma

Requirements:
- Use PostgreSQL datasource and Prisma generator as usual.
- Define models:

Model Player:
- id Int @id @default(autoincrement())
- username String @unique
- createdAt DateTime @default(now())
- gamesX Game[] @relation("PlayerX")
- gamesO Game[] @relation("PlayerO")
- moves Move[]

Model Game:
- id Int @id @default(autoincrement())
- createdAt DateTime @default(now())
- board String
- nextTurn String   // 'X' or 'O'
- status String     // 'waiting' | 'playing' | 'finished'
- playerXId Int?
- playerOId Int?
- playerX Player? @relation("PlayerX", fields: [playerXId], references: [id])
- playerO Player? @relation("PlayerO", fields: [playerOId], references: [id])
- moves Move[]

Model Move:
- id Int @id @default(autoincrement())
- index Int
- mark String        // 'X' or 'O'
- createdAt DateTime @default(now())
- gameId Int
- playerId Int?
- game Game @relation(fields: [gameId], references: [id])
- player Player? @relation(fields: [playerId], references: [id])

Constraints:
- Add sensible indexes (e.g. on username, gameId).

File 2: backend/prisma/seed.js

Requirements:
- Use @prisma/client.
- Create a PrismaClient instance.
- Seed:
  - Two sample players: 'alice' and 'bob'.
  - One sample game with:
    - board: '---------' (empty board)
    - nextTurn: 'X'
    - status: 'waiting'
    - playerX = alice
    - playerO = bob
- Log what was created and then disconnect.
- Handle errors with try/catch and finally prisma.$disconnect().

Also include in your response:
- A short README-style note on how to run:
  - npx prisma migrate dev --name init
  - node prisma/seed.js

Return:
- Full content of backend/prisma/schema.prisma.
- Full content of backend/prisma/seed.js.
- The README note as plain text.
```

---

### 4.5 Frontend: Vite React **TypeScript** scaffold

```text
Task: Create basic frontend files for a Vite + React + TypeScript Tic-Tac-Toe app.

Goal:
- Minimal but functional React app with TypeScript types.
- Use TSX for all React components, and .ts for non-JSX utilities/hooks.
- Have:
  - Lobby page (username + join button).
  - Game page (board + status).
- No styling framework, just simple CSS or inline styles.

Files to generate with full content:
1) frontend/index.html
2) frontend/package.json
   - Scripts: dev, build, preview
   - Dependencies: React, ReactDOM, TypeScript, Vite, @types/react, @types/react-dom
3) frontend/tsconfig.json
   - Reasonable defaults for a Vite React TS app.
4) frontend/vite.config.ts
   - Standard Vite + React plugin config.
5) frontend/src/main.tsx
   - Mount <App /> into #root.
6) frontend/src/App.tsx
   - Simple routing using React Router or a minimal custom router:
     - "/" -> Lobby
     - "/game" -> Game
   - Use TypeScript types for route components.
7) frontend/src/types/game.ts
   - Define shared frontend types:
     - GameState, PlayerMark, SocketState, etc. as needed.
8) frontend/src/components/Board.tsx
   - Renders a 3x3 grid of squares.
   - Props (typed):
     - board: string of length 9 (e.g. "XOX------")
     - onClick: (index: number) => void
     - disabled?: boolean
     - winningLine?: number[] | null
   - Visually highlight winningLine if provided (e.g. add a CSS class).
9) frontend/src/pages/Lobby.tsx
   - Show an input for username (controlled component).
   - Show a "Join Game" button.
   - On click, for now just navigate to "/game" and pass username via router state or a simple global context.
   - Use proper TypeScript types for props/hooks.
10) frontend/src/pages/Game.tsx
    - Placeholder that shows:
      - "Game Page" title.
      - <Board /> with simple local board state for now.
      - Some placeholder status text.
    - Include TODO comments where socket integration will be added later.
11) frontend/src/hooks/useGameSocket.ts
    - For now, just an empty hook stub that returns minimal typed state and actions, plus TODO comments.
12) frontend/src/styles.css (optional)
    - Basic layout / board styling.

Constraints:
- Use functional components and React hooks with TypeScript.
- Use TSX for React components (.tsx extension).
- Use strict-ish typing (no 'any' unless really needed, add TODO to refine types).
- Add TODO comments in Lobby and Game where socket logic will be added later.

Return:
- Full contents for all the above files.
```

---

### 4.6 Socket client hook (`frontend/src/hooks/useGameSocket.ts`)

```text
Task: Implement a TypeScript React hook to manage Socket.IO game communication.

File: frontend/src/hooks/useGameSocket.ts

Requirements:
- Use socket.io-client.
- Backend URL should come from: import.meta.env.VITE_BACKEND_URL
- Define clear TypeScript types or interfaces for:
  - PlayerMark = 'X' | 'O'
  - GameStatus = 'idle' | 'waiting' | 'playing' | 'finished'
  - GameState payload received from server (gameId, board, nextTurn, status, winner, winningLine, opponent, etc.)

Expose from the hook:
- State (typed):
  - connected: boolean
  - gameId: string | null
  - board: string
  - mark: PlayerMark | null
  - status: GameStatus
  - winner: PlayerMark | 'draw' | null
  - winningLine: number[] | null
  - opponent: { username: string } | null
  - error: string | null
- Actions (typed functions):
  - connect(username: string): void
    - Connects to the backend and emit 'join' with { username }.
  - makeMove(index: number): void
    - Emits 'move' with { gameId, index } if allowed.
  - leave(): void
    - Emits 'leave' with { gameId } and disconnects.
  - requestRematch(): void
    - Emits 'rematch' with { gameId } (server may not handle yet, add TODO).

Socket events to handle:
- 'connect' -> set connected = true.
- 'disconnect' -> set connected = false and maybe status = 'idle'.
- 'start' payload: { gameId, mark, opponent }
  - Set gameId, mark, opponent, board '---------', status 'playing'.
- 'state' payload: { gameId, board, nextTurn, status, winner, winningLine }
  - Update state accordingly.
- 'error' payload: { message }
  - Set error message.
- 'opponentLeft' payload (if server supports):
  - Update status and show a message.

Reconnect logic:
- Cache username and gameId in a ref or closure.
- On reconnection, attempt to rejoin or at least reconnect with username.
- Keep logic simple and well-commented.

Also:
- Clean up:
  - On hook consumer unmount, disconnect the socket.
- At the bottom of the file, include a commented example usage component written in TSX, showing how Game.tsx might use the hook.

Return:
- Full content of frontend/src/hooks/useGameSocket.ts.
```

---

### 4.7 Frontend Game page + integration (`frontend/src/pages/Game.tsx`)

```text
Task: Implement frontend/src/pages/Game.tsx that uses the useGameSocket hook in TypeScript.

Requirements:
- Import and use:
  - Board component (Board.tsx)
  - useGameSocket hook (useGameSocket.ts)
- Types:
  - Use proper React.FC or function component typing.
  - Use any shared types from src/types/game.ts if appropriate.

Behavior:
- Read username from:
  - React Router location state or search params OR
  - a simple global context.
  - You can choose a strategy and document it in comments.
- On mount:
  - If username is available and not yet connected to a game, call connect(username).
- Render:
  - Player mark: "You are X" or "You are O" (if mark is set).
  - Opponent username if available.
  - Current status text:
    - If status === 'waiting' -> "Waiting for an opponent..."
    - If status === 'playing' -> "Your turn" or "Opponent's turn" based on mark vs nextTurn-like info from state (extend hook if necessary).
    - If status === 'finished' and winner:
      - Show "You won!", "You lost.", or "It's a draw." based on winner and mark.
  - <Board /> with:
    - board from state.
    - onClick handler:
      - Prevent clicks if:
        - not your turn,
        - status is not 'playing',
        - winningLine exists.
      - Otherwise call makeMove(index).
    - disabled boolean for states when you cannot move.
    - winningLine from state for highlight.

Buttons:
- "Leave game" button:
  - Calls leave() and navigates back to Lobby ("/").
- "Rematch" button:
  - Calls requestRematch() and displays some UI hint (even if server doesn't handle it yet).

Environment:
- Note in a comment that VITE_BACKEND_URL must be set in frontend/.env.

Return:
- Full content of frontend/src/pages/Game.tsx.
- A brief note in comments at the top about how username is expected to be passed from Lobby.
```

---

### 4.8 Backend socket flow tests (`backend/tests/socket.flow.test.js`)

```text
Task: Create integration tests for Socket.IO flow.

File: backend/tests/socket.flow.test.js

Requirements:
- Use Jest and socket.io-client, and optionally supertest for /health.
- Test scenario:
  1. Start the backend server in test mode:
     - If needed, export a createServer() function from server.js or expose the http server for tests.
  2. Connect two socket.io clients to the server.
  3. For each client:
     - Emit 'join' with a different username.
  4. Expect both clients to receive a 'start' event with:
     - A gameId.
     - A mark ('X' or 'O').
     - opponent.username.
  5. Emit 'move' from player X:
     - { gameId, index: 0 }
  6. Expect the other client to receive a 'state' event eventually
     - For now, it can be a minimal state in sync with server logic (even if placeholder).

Other:
- Ensure tests close the socket connections and HTTP server after running.
- Use done callbacks or async/await properly to avoid open handles.

Also:
- Suggest an npm script for backend/package.json:
  - "test": "jest"
  - "test:watch": "jest --watch"

Return:
- Full content of backend/tests/socket.flow.test.js.
- The suggested package.json test scripts as a snippet (do not modify package.json directly).
```

---

### 4.9 GitHub Actions CI (`.github/workflows/ci.yml`)

```text
Task: Create a GitHub Actions CI workflow for the monorepo with a TypeScript React frontend.

File: .github/workflows/ci.yml

Requirements:
- Name: CI
- Triggers:
  - on: [push, pull_request]
- Runs on: ubuntu-latest.

Job: build-and-test
- Use a matrix for "package" with values: ["backend", "frontend"].
- Steps:
  1. actions/checkout@v4
  2. Use Node.js 18 via actions/setup-node@v4
     - Enable npm caching.
  3. Install dependencies:
     - run: npm install
     - working-directory: ./${{ matrix.package }}
  4. Run tests:
     - If backend:
       - npm test (if script exists) or echo 'no backend tests yet'
     - If frontend:
       - npm test or npm run test:unit if defined, otherwise echo 'no frontend tests yet'
  5. Build:
     - If frontend:
       - npm run build
     - If backend:
       - Optional: run npm run lint if defined, otherwise skip build.

Extras:
- Use conditionals (if:) in steps for backend vs frontend where needed.
- Keep workflow generic and not tightly coupled to any missing scripts.

Return:
- Full YAML content for .github/workflows/ci.yml.
```

---

### 4.10 DEPLOYMENT & secrets helper (`DEPLOYMENT.md`)

```text
Task: Create DEPLOYMENT.md describing how to deploy this Tic-Tac-Toe app.

File: DEPLOYMENT.md

Requirements:
- Sections:
  1) Overview
     - Explain that frontend is deployed on Vercel, backend on Render (or similar), DB on Supabase Postgres.
  2) Environment variables
     - List required env vars for backend:
       - DATABASE_URL (Supabase Postgres)
       - PORT
       - NODE_ENV
       - JWT_SECRET (placeholder if auth is added later)
     - For frontend:
       - VITE_BACKEND_URL
  3) Vercel setup (frontend)
     - Steps:
       - Import GitHub repo.
       - Set framework = Vite.
       - Set env var VITE_BACKEND_URL to the backend URL.
  4) Render setup (backend)
     - Steps:
       - Create new Web Service from GitHub repo.
       - Set start command (e.g. "node src/server.js").
       - Set environment variables, including DATABASE_URL.
       - Mention that Prisma migrations should be run (prisma migrate deploy).
  5) GitHub secrets
     - List typical secrets:
       - DATABASE_URL
       - VERCEL_TOKEN
       - VERCEL_PROJECT_ID
       - VERCEL_ORG_ID
       - RENDER_API_KEY
       - JWT_SECRET
  6) Example GitHub Action snippet for deploying frontend with amondnet/vercel-action
     - Provide a short example job using:
       - amondnet/vercel-action@v25
       - using the above secrets.

Constraints:
- Avoid real URLs or secrets, just placeholders.
- Keep text concise but clear.

Return:
- Full content of DEPLOYMENT.md.
```

---

## 5. Commands & run sequence (local dev)

```bash
# 1. Initialize git & repo
git init
git branch -M main
git remote add origin <your-github-url>

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Prisma & DB
cd backend
npx prisma migrate dev --name init
node prisma/seed.js

# 4. Run backend (dev)
cd backend
PORT=4000 npx nodemon src/server.js

# 5. Run frontend (dev)
cd frontend
npm run dev
```

Then open the Vite dev URL (usually `http://localhost:5173`).

---

## 6. Environment variables & `.env.example`

### Backend `.env.example` (`backend/.env.example`)

```env
PORT=4000
DATABASE_URL=postgres://user:pass@host:5432/dbname
NODE_ENV=development
JWT_SECRET=replace-me-for-prod
```

### Frontend `.env.example` (`frontend/.env.example`)

```env
VITE_BACKEND_URL=http://localhost:4000
```

Add `.env` to `.gitignore` and never commit real secrets.

---

## 7. Prisma & database steps

1. `cd backend`
2. `npm install -D prisma`
3. `npm install @prisma/client`
4. `npx prisma init`
5. Set `DATABASE_URL` in `backend/.env`
6. `npx prisma migrate dev --name init`
7. `node prisma/seed.js`
8. In CI/prod: `npx prisma migrate deploy`

---

## 8. Game logic summary (rules & API)

- Board: 9-char string indexed `0..8`, row-major:

  ```txt
  0 | 1 | 2
  3 | 4 | 5
  6 | 7 | 8
  ```

- Marks: `X`, `O`, `-` (empty).
- Win lines:
  - Rows: `[0,1,2] [3,4,5] [6,7,8]`
  - Cols: `[0,3,6] [1,4,7] [2,5,8]`
  - Diags: `[0,4,8] [2,4,6]`
- Server is **authoritative**:
  - Validates moves using `checkMove`.
  - Updates DB (Game + Move).
  - Emits authoritative `state` events.

- Lifecycle:
  - `waiting` → `playing` → `finished`.

---

## 9. Frontend responsibilities & hooks

- TSX components:
  - `Lobby.tsx` — collects username, navigates to game.
  - `Game.tsx` — uses `useGameSocket`, renders `Board.tsx`.
  - `Board.tsx` — pure presentational board component with typed props.

- Hook:
  - `useGameSocket.ts` — all socket.io-client logic, strongly typed.

- UI:
  - Prefer server state over optimistic UI (keep client mostly “dumb”).
  - Show clear status: waiting, your turn, opponent turn, game over.

---

## 10. Socket event contract (client ↔ server)

**Client → Server:**

- `join` `{ username }`
- `move` `{ gameId, index }`
- `leave` `{ gameId? }`
- `rematch` `{ gameId }` (optional)

**Server → Client:**

- `start`  
  `{ gameId, mark, opponent: { username } }`
- `state`  
  `{ gameId, board, nextTurn, status, winner, winningLine }`
- `error`  
  `{ message }`
- `opponentLeft`  
  `{ message }`

Keep payloads small and document them as JSDoc comments in server and client code.

---

## 11. Testing strategy (unit, integration, e2e)

- **Unit tests:**
  - `checkMove` logic.
  - Any small pure utilities.

- **Integration tests:**
  - Socket flow tests:
    - Two clients connecting, joining, receiving `start`, sending `move`, receiving `state`.

- **E2E tests (optional):**
  - Cypress or Playwright:
    - Two browsers (or two windows) playing a full game.

- Scripts (backend `package.json`):

  ```jsonc
  {
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watch",
    },
  }
  ```

---

## 12. CI/CD: secrets & behavior

**Secrets to configure in GitHub repo:**

- `DATABASE_URL`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`
- `RENDER_API_KEY`
- `JWT_SECRET` (if auth)

**CI behavior (via `ci.yml`):**

- On push/PR:
  - Install deps for `frontend` and `backend` via matrix.
  - Run tests.
  - Build frontend.
- Optionally on push to `main`:
  - Trigger deploy jobs to Vercel/Render or rely on platform GitHub integrations.

---

## 13. Deploy recommendations

- **Frontend:** Vercel
  - Perfect for Vite.
  - Set `VITE_BACKEND_URL` env var to your backend URL.

- **Backend:** Render / Railway / Fly
  - Node service with `node src/server.js`.
  - Set `PORT`, `DATABASE_URL`, `NODE_ENV`.

- **DB:** Supabase Postgres (already set up by you)
  - Use connection string as `DATABASE_URL`.

> Free tiers may sleep/scale-to-zero; expect occasional first-request latency.

---

## 14. Security & best practices checklist

- Never commit real secrets or `.env` files.
- Keep `.env.example` with placeholders only.
- Use Prisma migrations; keep them in repo.
- Validate all socket payloads:
  - `username` length/characters.
  - `index` is integer and 0..8.
  - `gameId` corresponds to a game the user is actually in.
- Rate-limit or throttle socket events to avoid abuse.
- Log basic events and errors on the server.
- Implement `/health` endpoint for uptime checks.
- Add ESLint + Prettier and run them in CI.
- Protect `main` branch with required status checks.

---

## 15. Helpful Copilot follow-up prompts

You can paste these when refining:

- **Refactor logic:**

  ```text
  Refactor backend/src/game/checkMove.js to:
  - Extract validation into a separate pure function.
  - Extract winner detection into another function.
  - Keep checkMove as a simple coordinator function.
  - Update tests accordingly and add tests for the new helper functions.
  ```

- **Add TypeScript to backend (optional):**

  ```text
  Convert backend/src/game/checkMove.js to TypeScript:
  - Create backend/src/game/checkMove.ts
  - Add appropriate types and interfaces.
  - Update Jest config to support TypeScript if needed.
  ```

- **Accessibility:**

  ```text
  Improve accessibility for frontend/src/components/Board.tsx:
  - Add ARIA labels for each square.
  - Support keyboard navigation (arrow keys and Enter/Space to make moves).
  - Ensure focus styles are visible.
  ```

- **More socket tests:**

  ```text
  Extend backend/tests/socket.flow.test.js:
  - Simulate an entire game where X wins.
  - Assert that winner and winningLine are correctly set in the 'state' event.
  - Assert that the final status is 'finished'.
  ```

---

## 16. Appendix: file headers & in-file prompts

### 16.1 Minimal backend server comment header

```js
/*
  Task: Implement backend/src/server.js for Tic-Tac-Toe

  Requirements:
  - Express + Socket.IO server
  - /health endpoint
  - Socket events: join, move, leave
  - In-memory matchmaking and game state
  - TODO: wire Prisma persistence and checkMove win detection
*/
```

### 16.2 Minimal `checkMove` header

```js
/*
  Task: Implement pure function checkMove({ board, index, mark, expectedNextTurn })

  - board: '---------' or 'XOX-O----', a string of length 9
  - index: 0..8
  - mark: 'X' or 'O'
  - expectedNextTurn: optional 'X' or 'O'

  Return:
  {
    valid: boolean,
    newBoard: string,
    winner: 'X' | 'O' | null,
    draw: boolean,
    nextTurn: 'X' | 'O' | null,
    reason?: string
  }
*/
```
