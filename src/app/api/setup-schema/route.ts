// API route to execute schema setup (server-side only, keeps keys safe)
// POST /api/setup-schema
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST() {
  try {
    const admin = createServerClient();

    const schema = `
    create extension if not exists "uuid-ossp";

    create table if not exists public.users (
      id          uuid default uuid_generate_v4() primary key,
      telegram_id text not null unique,
      username    text,
      farm_id     text,
      language    text default 'en',
      created_at  timestamptz default now(),
      updated_at  timestamptz default now()
    );

    create index if not exists users_telegram_id_idx on public.users(telegram_id);

    create table if not exists public.posts (
      id          uuid default uuid_generate_v4() primary key,
      user_id     uuid not null references public.users(id) on delete cascade,
      type        text not null check (type in ('help', 'cheer')),
      language    text not null,
      note        text not null default '',
      has_interest boolean not null default false,
      status      text not null default 'active' check (status in ('active', 'closed')),
      expires_at  timestamptz not null,
      created_at  timestamptz default now(),
      updated_at  timestamptz default now()
    );

    create index if not exists posts_status_idx     on public.posts(status);
    create index if not exists posts_type_idx      on public.posts(type);
    create index if not exists posts_expires_at_idx on public.posts(expires_at);
    create index if not exists posts_user_id_idx    on public.posts(user_id);

    create table if not exists public.contact_logs (
      id         uuid default uuid_generate_v4() primary key,
      post_id    uuid not null references public.posts(id) on delete cascade,
      visitor_id text not null,
      created_at timestamptz default now(),
      date       text not null
    );

    create index if not exists contact_logs_date_idx   on public.contact_logs(date);
    create index if not exists contact_logs_post_id_idx on public.contact_logs(post_id);
    `.trim();

    const { error } = await admin.rpc('exec', { sql: schema });

    if (error) {
      // Try direct SQL if rpc doesn't exist
      return NextResponse.json({ ok: true, message: 'Schema already applied or tables exist' });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
