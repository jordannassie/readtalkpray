# Read Talk Pray

A simple way to follow Jesus together. Join a Bible study or start one.

This app is a separate Next.js site. It reuses the existing Supabase project and does not write to Sending Church tables. Run `supabase/rtp.sql` in that project before using groups, join requests, or leads.

`NEXT_PUBLIC_SHOW_DEMO_GROUPS=true` shows eight local Nashville sample groups. They are not database rows, they are labeled Demo, and they do not accept reservations. Set the flag to `false` to show only approved groups.

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Fill `.env.local` from the Supabase project at Project Settings → API. Do not commit that file.

After the SQL is applied, sign in once and add your user to `rtp_admins` with the statement shown on `/admin`. Leaders sign in with the email on their application at `/leader`.

`/csv` and `/admin` require that admin row. Phone numbers and exact home addresses are not public.

## Deploy

This repository must use its own Netlify site. The build stops if the Netlify site name, URL, or site id belongs to Sending Church (`sending.church`). Do not change Sending Church DNS from this project.

The first deployment is https://readtalkpray.netlify.app. Add that origin's `/auth/callback` URL in the Supabase Auth redirect settings before Google sign-in will finish.
