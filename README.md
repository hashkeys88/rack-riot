# Rack Riot

React + Vite + Tailwind app for social shopping sessions with Supabase backend, deployable on Vercel.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](/Users/rajat/Code/rack-riot/supabase/schema.sql) in the Supabase SQL editor.
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
