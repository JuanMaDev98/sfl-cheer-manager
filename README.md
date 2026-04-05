# SFL Cheer Manager

Telegram Mini App for Sunflower Land players to exchange Help x Help and Cheer x Cheer.

## Tech Stack
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Cloudflare Pages
- **Integration:** Telegram Mini Apps SDK

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Setup

Run the SQL schema in `supabase/schema.sql` in your Supabase dashboard.

## Build

```bash
npm run build
```

## Deploy to Cloudflare Pages

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `.next`

## Features

- Onboarding with Sunflower Land Farm ID lookup
- Publish Help x Help or Cheer x Cheer requests
- Filter by type, language, no-interest posts
- Contact users directly via Telegram DM
- Interest badge when someone contacts a post
- 24-hour auto-expiry
- Daily activity counters
- i18n: English & Spanish
