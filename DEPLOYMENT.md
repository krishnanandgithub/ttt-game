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

## Notes

- Never commit `.env` files.
- For migrations in CI: run `npx prisma migrate deploy`.
- For local development use `npx prisma migrate dev --name init` then `node prisma/seed.js`.
