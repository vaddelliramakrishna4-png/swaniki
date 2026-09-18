-- ==========================================================
-- VIBE BY SWANIKI — COMPLETE SUPABASE SCHEMA & RLS POLICIES
-- Standing Rules Alignment (profiles, events, rsvps, comments, follows, date_polls)
-- ==========================================================

-- 1. PROFILES TABLE (Extends auth.users)
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

-- 2. EVENTS TABLE
create table if not exists public.events (
  id uuid not null default gen_random_uuid () primary key,
  organizer_id uuid null references auth.users (id) on delete set null,
  slug text unique null,
  title text not null,
  tagline text null,
  description text null,
  cover_url text null,
  cover_image_url text null,
  category text null,
  theme_template text null default 'Grove'::text,
  theme jsonb default '{}'::jsonb,
  sections jsonb default '{"speakers":[], "agenda":[], "gallery":[], "faq":[]}'::jsonb,
  event_type text null default 'in-person'::text,
  location text null,
  location_name text null,
  location_address text null,
  city text null,
  venue_name text null,
  online_link text null,
  is_virtual boolean default false,
  start_time timestamp with time zone not null default now(),
  end_time timestamp with time zone null,
  start_at timestamp with time zone not null default now(),
  end_at timestamp with time zone not null default now(),
  timezone text default 'Asia/Kolkata'::text,
  capacity integer default 50,
  is_public boolean default true,
  approval_required boolean default false,
  status text default 'published'::text check (status in ('draft', 'live', 'published', 'past', 'cancelled')),
  ai_generated boolean default false,
  custom_questions jsonb default '[]'::jsonb,
  rsvp_form_config jsonb default '{"enable_plus_one": false, "enable_dietary": false, "custom_questions": []}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Non-destructive column additions in case table was partially created
alter table public.events add column if not exists slug text unique;
alter table public.events add column if not exists tagline text;
alter table public.events add column if not exists cover_image_url text;
alter table public.events add column if not exists theme jsonb default '{}'::jsonb;
alter table public.events add column if not exists sections jsonb default '{"speakers":[], "agenda":[], "gallery":[], "faq":[]}'::jsonb;
alter table public.events add column if not exists event_type text default 'in-person'::text;
alter table public.events add column if not exists location_name text;
alter table public.events add column if not exists location_address text;
alter table public.events add column if not exists city text;
alter table public.events add column if not exists online_link text;
alter table public.events add column if not exists start_at timestamp with time zone default now();
alter table public.events add column if not exists end_at timestamp with time zone default now();
alter table public.events add column if not exists timezone text default 'Asia/Kolkata'::text;
alter table public.events add column if not exists is_public boolean default true;
alter table public.events add column if not exists ai_generated boolean default false;
alter table public.events add column if not exists rsvp_form_config jsonb default '{"enable_plus_one": false, "enable_dietary": false, "custom_questions": []}'::jsonb;

-- 3. RSVPS TABLE
create table if not exists public.rsvps (
  id uuid not null default gen_random_uuid () primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid null references auth.users (id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  phone text null,
  plus_one_name text null,
  status text default 'confirmed'::text check (status in ('confirmed', 'waitlisted', 'cancelled')),
  answers jsonb default '{}'::jsonb,
  custom_responses jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  constraint rsvps_event_id_guest_email_key unique (event_id, guest_email)
);

alter table public.rsvps add column if not exists phone text;
alter table public.rsvps add column if not exists plus_one_name text;
alter table public.rsvps add column if not exists custom_responses jsonb default '{}'::jsonb;

-- 4. COMMENTS TABLE (Community Discussion Board)
create table if not exists public.comments (
  id uuid not null default gen_random_uuid () primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  author_name text not null,
  author_email text null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- 5. FOLLOWS TABLE
create table if not exists public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  organizer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, organizer_id)
);

-- 6. DATE POLLS TABLE (Pre-Event Availability)
create table if not exists public.date_polls (
  id uuid not null default gen_random_uuid () primary key,
  organizer_id uuid null references auth.users (id) on delete cascade,
  title text not null,
  slug text unique not null,
  options jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- ==========================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.date_polls enable row level security;

-- PROFILES:
drop policy if exists "Public can view profiles" on public.profiles;
create policy "Public can view profiles" on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- EVENTS:
drop policy if exists "Public can read live events" on public.events;
create policy "Public can read live events" on public.events
  for select using (
    status in ('published', 'live') 
    or (auth.uid() is not null and organizer_id = auth.uid())
    or organizer_id is null
  );

drop policy if exists "Organizers can insert events" on public.events;
create policy "Organizers can insert events" on public.events
  for insert with check (true);

drop policy if exists "Organizers can update own events" on public.events;
create policy "Organizers can update own events" on public.events
  for update using (
    organizer_id is null or organizer_id = auth.uid()
  );

drop policy if exists "Organizers can delete own events" on public.events;
create policy "Organizers can delete own events" on public.events
  for delete using (
    organizer_id is null or organizer_id = auth.uid()
  );

-- RSVPS:
drop policy if exists "Public can submit RSVPs" on public.rsvps;
create policy "Public can submit RSVPs" on public.rsvps
  for insert with check (true);

drop policy if exists "Public can view RSVPs" on public.rsvps;
create policy "Public can view RSVPs" on public.rsvps
  for select using (true);

drop policy if exists "Organizers can manage RSVPs" on public.rsvps;
create policy "Organizers can manage RSVPs" on public.rsvps
  for update using (true);

-- COMMENTS:
drop policy if exists "Public can view comments" on public.comments;
create policy "Public can view comments" on public.comments
  for select using (true);

drop policy if exists "Public can post comments" on public.comments;
create policy "Public can post comments" on public.comments
  for insert with check (true);

-- DATE POLLS:
drop policy if exists "Public can view date polls" on public.date_polls;
create policy "Public can view date polls" on public.date_polls
  for select using (true);

drop policy if exists "Organizers can manage date polls" on public.date_polls;
create policy "Organizers can manage date polls" on public.date_polls
  for all using (true);

-- Realtime Configuration
do $$
begin
  begin alter publication supabase_realtime add table public.events; exception when others then null; end;
  begin alter publication supabase_realtime add table public.rsvps; exception when others then null; end;
  begin alter publication supabase_realtime add table public.comments; exception when others then null; end;
end $$;
