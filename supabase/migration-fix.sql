-- ==============================================================================
-- VIBE BY SWANIKI — SCHEMA MIGRATION FIX
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'organizer'::text check (role in ('organizer', 'guest')),
  name text not null,
  handle text unique,
  bio text null,
  logo_url text null,
  brand_color text null default '#1A1A2E'::text,
  brand_font text null default 'Inter'::text,
  phone text null,
  email text null,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public can view profiles" on public.profiles;
create policy "Public can view profiles" on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. EVENTS TABLE COLUMNS
alter table public.events add column if not exists start_at timestamp with time zone default now();
alter table public.events add column if not exists end_at timestamp with time zone default now();
alter table public.events add column if not exists location_name text;
alter table public.events add column if not exists location_address text;
alter table public.events add column if not exists city text;
alter table public.events add column if not exists rsvp_form_config jsonb default '{"enable_plus_one": false, "enable_dietary": false, "custom_questions": []}'::jsonb;

-- 3. RSVPS TABLE CONSTRAINTS & REALTIME
create table if not exists public.rsvps (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  status text null default 'confirmed',
  answers jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint rsvps_pkey primary key (id),
  constraint rsvps_event_id_guest_email_key unique (event_id, guest_email)
);

alter table public.rsvps enable row level security;

drop policy if exists "Public can submit RSVPs" on public.rsvps;
create policy "Public can submit RSVPs" on public.rsvps
  for insert with check (true);

drop policy if exists "Public can view RSVPs" on public.rsvps;
create policy "Public can view RSVPs" on public.rsvps
  for select using (true);

drop policy if exists "Organizers can manage RSVPs" on public.rsvps;
create policy "Organizers can manage RSVPs" on public.rsvps
  for update using (true);

-- Enable Realtime
do $$
begin
  begin alter publication supabase_realtime add table public.events; exception when others then null; end;
  begin alter publication supabase_realtime add table public.rsvps; exception when others then null; end;
  begin alter publication supabase_realtime add table public.profiles; exception when others then null; end;
end $$;
