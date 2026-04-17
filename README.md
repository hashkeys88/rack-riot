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
3. Copy env file and fill credentials:
   ```bash
   cp .env.example .env
   ```
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
