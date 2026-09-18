-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Creates the password storage table for Vibe's self-managed password auth

create table if not exists public.user_credentials (
  email       text primary key,
  pwd_hash    text not null,
  name        text,
  handle      text,
  phone       text,
  role        text default 'organizer',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Enable RLS
alter table public.user_credentials enable row level security;

-- Allow anon/service role inserts and selects (auth is done server-side)
create policy "Server can manage credentials"
  on public.user_credentials
  using (true)
  with check (true);
