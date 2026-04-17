# Rack Riot

React + Vite + Tailwind app for social shopping sessions with Supabase backend, deployable on Vercel.

## Setup

1. Create Supabase projects for dev and prod at [supabase.com](https://supabase.com).
2. Put your direct Postgres connection strings in env vars:
   - `SUPABASE_DB_URL_DEV`
   - `SUPABASE_DB_URL_PROD`
3. Apply migrations from code instead of the SQL editor:
   - `npm run db:migrate:waitlist:dev`
   - `npm run db:migrate:waitlist:prod`
4. Copy env file and fill credentials:
   ```bash
   cp .env.example .env
   ```

## Smoke Tests

Use the dev smoke test before shipping logic or data-flow changes:

```bash
npm run test:smoke:dev
```

Current smoke coverage:
- unified `waitlist` intake flow
- client insert succeeds
- stylist insert succeeds
- same email can exist once per `type`
- duplicate same-type insert is blocked

Team rule:
- run smoke tests for changes in logic, database behavior, validation, or submission flows
- do not require smoke tests for purely visual/frontend-only changes
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Add the same env vars in the Vercel dashboard under your project settings.
5. Redeploy from the Vercel dashboard.

## Local Development

```bash
npm install
npm run dev
```

## Build Check

```bash
npm run build
```

## Create Admin User

1. Sign up normally with any email from the app.
2. In Supabase dashboard, open the `users` table and set that row's `role` to `admin`.
