# Tic-Tac-Toe Backend

This backend is a starter Express + Socket.IO server with placeholders for Prisma integration.

Quick start

1. Install dependencies:

```bash
cd backend
npm install
```

2. Set your DB connection string in `.env` (use `.env.example` as reference). Do NOT commit `.env`.

3. Run Prisma migrations (once DB is ready):

```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

4. Run in dev:

```bash
npm run dev
```

Endpoints

- `GET /health` — returns `{ status: 'ok' }`

Socket events (see `src/server.js`): `join`, `move`, `leave`, `start`, `state`, `error`.
