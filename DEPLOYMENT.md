# Deployment Guide

## Overview

This project is intended to run with the frontend deployed to Vercel and the backend deployed to Render, and the database hosted on Supabase (Postgres).

## Environment variables

- Backend (`backend` service):

  - `DATABASE_URL` — Postgres connection string (Supabase). Example: `postgres://user:pass@host:5432/db`
  - `PORT` — port for the Node server (default 4000)
  - `NODE_ENV` — `production` or `development`
  - `JWT_SECRET` — placeholder if auth is added later

- Frontend (`frontend` site):
  - `VITE_BACKEND_URL` — full backend URL (e.g. `https://your-backend.onrender.com`)

## Vercel (frontend)

1. Import the GitHub repository into Vercel.
2. Set Framework Preset to `Vite`.
3. Add Environment Variable `VITE_BACKEND_URL` pointing to your backend URL.
4. Deploy — Vercel will run `npm install` and `npm run build` in the `frontend` directory.

## Render (backend)

1. Create a new Web Service from the GitHub repo.
2. Set the Build Command to: `npm install && npm run build` and Start Command to: `node dist/server.js` (or use PM2 if desired).
3. Add Environment Variables including `DATABASE_URL` and `PORT`.
4. Run `npx prisma migrate deploy` in Render's deploy hooks or use a one-time job to run migrations/seed.

## Supabase (database)

1. Create a new project and copy the Postgres connection string.
2. Add the connection string to Render as `DATABASE_URL` and to your local `backend/.env` for local dev.

## Secrets & GitHub

Add necessary secrets to the GitHub repository for CI/CD if you automate deployments (VERCEL_TOKEN, RENDER_API_KEY, DATABASE_URL, etc.).

This repo includes example GitHub Actions workflows in `.github/workflows/`:

- `ci.yml` — runs build and tests for frontend and backend on push / PR.
- `deploy-frontend.yml` — deploys the `frontend` to Vercel on push to `main` or manual dispatch.
  Required secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- `deploy-backend-render.yml` — triggers a deploy of the backend on Render via the Render API.
  Required secrets: `RENDER_API_KEY`, `RENDER_SERVICE_ID`.
- `prisma-migrate.yml` — a manual (workflow_dispatch) job to run `npx prisma migrate deploy` against production. Requires `DATABASE_URL` to be set as a repository secret.

Keep these secrets up-to-date in the repository `Settings -> Secrets and variables -> Actions`. Use protected branches and review processes for any workflows that run migrations or trigger production deploys.

## Step-by-step Setup Guide 🚀

### Prerequisites

- GitHub repo with this code pushed
- Supabase or another Postgres provider with a `DATABASE_URL`

### Step 1: Set up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and sign up.
2. Create a new project (choose a region close to you).
3. Wait for the project to initialize, then go to **Settings → Database**.
4. Copy the "Connection string" (click the copy icon).
5. **Keep this safe** — you'll add it as `DATABASE_URL` in both Render and GitHub.
6. (Optional) Run `npx prisma migrate deploy` locally to test the connection before adding to GitHub.

---

### Step 2: Deploy Backend on Render

#### 2a. Create and deploy the service

1. Go to [render.com](https://render.com) and sign up / log in.
2. Click **"New +"** → **Web Service**.
3. Select **"Deploy an existing repository"** (or connect your GitHub account).
4. Select your GitHub repo → click **Deploy**.
5. On the new service page, configure:
   - **Name**: e.g., `ttt-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (to start)
6. Click **Create Web Service**. Render will start building from `main`.

#### 2b. Add environment variables

1. On the Render service page, go to **Environment** tab.
2. Add:
   - `DATABASE_URL` = paste your Supabase connection string
   - `NODE_ENV` = `production`
   - `PORT` = `4000` (or leave empty for default)
3. Click **Save**.
4. Once the service finishes building, note the service URL (e.g., `https://ttt-backend.onrender.com`).

#### 2c. Get Render secrets for GitHub Actions

1. On the Render service page, go to the **Settings** tab.
2. Scroll down to **API Key** and copy it (you'll need this as `RENDER_API_KEY`).
3. Also copy the **Service ID** from the URL or from the service overview (you'll need this as `RENDER_SERVICE_ID`).
   - Service ID is the part after `https://dashboard.render.com/web/` in the URL.

---

### Step 3: Deploy Frontend on Vercel

#### 3a. Create and deploy the site

1. Go to [vercel.com](https://vercel.com) and sign up / log in.
2. Click **"Add new..."** → **Project**.
3. Select **"Import Git Repository"** and choose your GitHub repo.
4. Vercel will auto-detect it's a monorepo; configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

#### 3b. Add environment variables

1. On the project page, go to **Settings** → **Environment Variables**.
2. Add:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: Your Render backend URL (e.g., `https://ttt-backend.onrender.com`)
   - **Environments**: Select `Production`, `Preview`, and `Development`
3. Click **Save**.
4. Trigger a redeployment (click **Deployments** → **Redeploy** on the latest one, or push a commit to `main`).

#### 3c. Get Vercel secrets for GitHub Actions

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. Click **Create Token**, give it a name (e.g., `ttt-deploy`), and copy the token. This is your `VERCEL_TOKEN`.
3. For `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`:
   - Go to your project in Vercel.
   - Run this in your local terminal:
     ```bash
     npm install -g vercel
     vercel env pull .env.local --cwd=./frontend
     ```
   - Open the `.env.local` file that was created — you'll see:
     ```
     VERCEL_ORG_ID=...
     VERCEL_PROJECT_ID=...
     ```
   - Copy these values (or find them in Vercel → Settings → General).

---

### Step 4: Add GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**.
2. Click **"New repository secret"** and add:

   | Secret Name         | Value                                | Where to get it                                     |
   | ------------------- | ------------------------------------ | --------------------------------------------------- |
   | `DATABASE_URL`      | Your Supabase connection string      | Supabase → Settings → Database → Connection String  |
   | `VERCEL_TOKEN`      | Token from vercel.com/account/tokens | Vercel Account → Tokens                             |
   | `VERCEL_ORG_ID`     | Your org ID                          | Vercel project → `.env.local` or Settings → General |
   | `VERCEL_PROJECT_ID` | Your project ID                      | Vercel project → `.env.local` or Settings → General |
   | `RENDER_API_KEY`    | API Key from Render service          | Render service → Settings → API Key                 |
   | `RENDER_SERVICE_ID` | Service ID                           | Render service URL or Overview page                 |

3. After adding all secrets, you're done! 🎉

---

### Step 5: Test the setup

1. **Test CI**: Push a branch or PR — the CI workflow (`.github/workflows/ci.yml`) should run and build both frontend and backend.
2. **Deploy frontend**: Merge to `main` or manually trigger via GitHub Actions → `Deploy Frontend (Vercel)` → **Run workflow**.
3. **Deploy backend**: Merge to `main` or manually trigger via GitHub Actions → `Deploy Backend (Render)` → **Run workflow**.
4. **Run migrations** (if needed): Manually trigger via GitHub Actions → `Run Prisma Migrate (manual)` → **Run workflow**.
5. Visit your deployed frontend URL to test — it should connect to the backend via the socket.io connection.

---

### Troubleshooting

- **"Vercel deploy fails"**: Check that `VITE_BACKEND_URL` is set in Vercel project environment variables.
- **"Socket.io connection fails"**: Make sure the backend URL in your frontend env matches the deployed backend URL, and CORS is enabled on the backend.
- **"Render service won't start"**: Check logs in Render → Service → Logs. Ensure `DATABASE_URL` is set and correct.
- **"Migrations fail"**: Run the `prisma-migrate.yml` workflow manually, or check that `DATABASE_URL` is set in GitHub secrets.

---

## Notes

- Never commit `.env` files.
- For migrations in CI: run `npx prisma migrate deploy`.
- For local development use `npx prisma migrate dev --name init` then `node prisma/seed.js`.
