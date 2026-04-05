// ============================================
// SFL CHEER MANAGER - Project Plan & Status
// ============================================
// Created: 2026-04-05
// User: JuanMa (OMF_CAT)
// Stack: Next.js + TypeScript + Tailwind + Supabase + Cloudflare Pages
// Telegram Mini App for Sunflower Land players
//
// PHASES
// ------
// [DONE] Phase 0: Project scaffolding (Next.js base)
// [IN PROGRESS] Phase 1: Foundation (types, utils, env, i18n)
// [ ] Phase 2: Supabase schema + client
// [ ] Phase 3: UI components (Sunflower Land style)
// [ ] Phase 4: Pages: Onboarding
// [ ] Phase 5: Pages: Home feed + filters
// [ ] Phase 6: Pages: Create post
// [ ] Phase 7: Pages: Post detail + contact
// [ ] Phase 8: Badges, counters, metrics
// [ ] Phase 9: 24h auto-expiry logic
// [ ] Phase 10: Styling + polish
// [ ] Phase 11: Deploy to Cloudflare Pages
// [ ] Phase 12: GitHub repo + setup
//
// SUNFLOWER LAND API
// ------------------
// Farm ID -> Username: use sfl.world API (public, no auth)
// GET https://sfl.world/api/farm/{farmId}
// Expected response: { farm_id, username }
// Fallback: skip validation if API is down (MVP allows manual entry)
//
// DATABASE (Supabase)
// -------------------
// Table: users
// Table: posts
// Table: contacts (daily counter)
//
// TELEGRAM MINIAPP
// ----------------
// Init with telegram-web-app.js
// Use WebApp.initDataUnsafe.user for auth
// Deep link: t.me/yourbot/appname?startapp=...
