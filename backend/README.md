# Tic-Tac-Toe Backend

This backend is a starter Express + Socket.IO server with placeholders for Prisma integration.

Quick start

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` locally with your DB connection string (use `.env.example` as reference). Do NOT commit `.env`.

3. (Optional but recommended) Add your DB connection string to GitHub Actions as a secret named `DATABASE_URL` so CI/deploy can access the DB without storing credentials in the repo.
   - Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret.
   - Set **Name**: `DATABASE_URL`
   - Set **Value**: your Postgres connection string. For Supabase use the URL form, URL-encoding any special characters in the password (e.g. `@` → `%40`). Example value (replace password):

     `postgresql://postgres:Krishnanand%402004@db.zieassoimpaxriflvtiw.supabase.co:5432/postgres`

4. Run Prisma migrations (once DB is ready):

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
