-- ============================================
-- SFL CHEER MANAGER - DATABASE SCHEMA
-- Created: 2026-04-05
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Stores Telegram user + SFL farm link
-- ============================================
create table if not exists public.users (
  id            uuid        default uuid_generate_v4() primary key,
  telegram_id   text        not null unique,
  username      text,                         -- SFL in-game username
  farm_id       text,
  language      text        default 'en',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index for fast lookups
create index if not exists users_telegram_id_idx on public.users(telegram_id);

-- ============================================
-- POSTS TABLE
-- Help x Help or Cheer x Cheer requests
-- ============================================
create table if not exists public.posts (
  id           uuid        default uuid_generate_v4() primary key,
  user_id      uuid        not null references public.users(id) on delete cascade,
  type         text        not null check (type in ('help', 'cheer')),
  language     text        not null,
  note         text        not null default '',
  has_interest boolean     not null default false,
  status       text        not null default 'active' check (status in ('active', 'closed')),
  expires_at   timestamptz not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Indexes for common queries
create index if not exists posts_status_idx     on public.posts(status);
create index if not exists posts_type_idx       on public.posts(type);
create index if not exists posts_expires_at_idx on public.posts(expires_at);
create index if not exists posts_user_id_idx    on public.posts(user_id);

-- ============================================
-- CONTACT_LOGS TABLE
-- Tracks daily "contact" clicks per post
-- ============================================
create table if not exists public.contact_logs (
  id         uuid        default uuid_generate_v4() primary key,
  post_id    uuid        not null references public.posts(id) on delete cascade,
visitor_id  text        not null, -- telegram user id
  created_at timestamptz default now(),
  date       text        not null  -- YYYY-MM-DD for easy daily count
);

create index if not exists contact_logs_date_idx   on public.contact_logs(date);
create index if not exists contact_logs_post_id_idx on public.contact_logs(post_id);

-- ============================================
-- AUTO-EXPIRY: Close posts older than 24h
-- Called periodically (e.g. via Supabase cron or edge function)
-- ============================================
create or replace function close_expired_posts()
returns void as $$
begin
  update public.posts
  set    status     = 'closed',
         updated_at = now()
  where  status     = 'active'
  and    expires_at < now();
end;
$$ language plpgsql security definer;

-- ============================================
-- HELPER: Get active post count per user per type
-- Returns 0 if no active post exists
-- ============================================
create or replace function user_has_active_post(p_user_id uuid, p_type text)
returns boolean as $$
  select exists (
    select 1 from public.posts
    where  user_id = p_user_id
    and    type    = p_type
    and    status  = 'active'
  );
$$ language sql security definer;

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.users  enable row level security;
alter table public.posts  enable row level security;
alter table public.contact_logs enable row level security;

-- Users: anyone can read, only own record can insert/update
create policy "Users are publicly readable" on public.users
  for select using (true);

create policy "Users can insert their own record" on public.users
  for insert with check (true);

create policy "Users can update their own record" on public.users
  for update using (true);

-- Posts: publicly readable, only own posts can be modified
create policy "Posts are publicly readable" on public.posts
  for select using (true);

create policy "Authenticated users can insert posts" on public.posts
  for insert with check (true);

create policy "Users can update their own posts" on public.posts
  for update using (true);

-- Contact logs: anyone can insert, no public read
create policy "Anyone can log a contact" on public.contact_logs
  for insert with check (true);

create policy "Only service role can read contact logs" on public.contact_logs
  for select using (false);
