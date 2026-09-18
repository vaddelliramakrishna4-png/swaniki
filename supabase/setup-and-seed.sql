-- ==========================================================
-- VIBE BY SWANIKI — COMPLETE SETUP & DATABASE SEED SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click "RUN"
-- URL: https://supabase.com/dashboard/project/fccdvpgcgvmekbfsfnfn/sql/new
-- ==========================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. CREATE / UPDATE EVENTS TABLE
create table if not exists public.events (
  id uuid not null default gen_random_uuid () primary key,
  organizer_id uuid null references auth.users (id) on delete set null,
  slug text unique null,
  title text not null,
  tagline text null,
  description text null,
  cover_url text null,
  category text null,
  theme_template text null default 'Grove'::text,
  theme jsonb default '{}'::jsonb,
  sections jsonb default '{"speakers":[], "agenda":[], "gallery":[], "faq":[]}'::jsonb,
  event_type text null default 'in-person'::text,
  location text null,
  venue_name text null,
  online_link text null,
  is_virtual boolean default false,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone null,
  timezone text default 'Asia/Kolkata'::text,
  capacity integer default 50,
  is_public boolean default true,
  approval_required boolean default false,
  status text default 'published'::text,
  ai_generated boolean default false,
  custom_questions jsonb default '[]'::jsonb,
  rsvp_form_config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Safely make organizer_id nullable if it was strictly NOT NULL
alter table public.events alter column organizer_id drop not null;

-- Add any missing columns non-destructively
alter table public.events add column if not exists slug text;
alter table public.events add column if not exists tagline text;
alter table public.events add column if not exists sections jsonb default '{"speakers":[], "agenda":[], "gallery":[], "faq":[]}'::jsonb;
alter table public.events add column if not exists theme jsonb default '{}'::jsonb;
alter table public.events add column if not exists venue_name text;
alter table public.events add column if not exists is_virtual boolean default false;
alter table public.events add column if not exists custom_questions jsonb default '[]'::jsonb;

-- 3. CREATE / UPDATE RSVPS TABLE
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
  created_at timestamp with time zone default now(),
  constraint rsvps_event_id_guest_email_key unique (event_id, guest_email)
);

alter table public.rsvps add column if not exists phone text;
alter table public.rsvps add column if not exists plus_one_name text;
alter table public.rsvps add column if not exists answers jsonb default '{}'::jsonb;

-- 4. CREATE PROFILES TABLE
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

-- 5. CREATE COMMENTS TABLE
create table if not exists public.comments (
  id uuid not null default gen_random_uuid () primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  author_name text not null,
  author_email text null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- 6. CREATE FOLLOWS TABLE
create table if not exists public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  organizer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, organizer_id)
);

-- 7. CONFIGURE OPEN ROW-LEVEL SECURITY (RLS) POLICIES
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.profiles enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- Events Policies (Public Read & Insert, Host Update & Delete)
drop policy if exists "Public can read events" on public.events;
create policy "Public can read events" on public.events for select using (true);

drop policy if exists "Public can insert events" on public.events;
create policy "Public can insert events" on public.events for insert with check (true);

drop policy if exists "Public can update events" on public.events;
create policy "Public can update events" on public.events for update using (true);

-- RSVPs Policies (Public Read & Insert)
drop policy if exists "Public can read rsvps" on public.rsvps;
create policy "Public can read rsvps" on public.rsvps for select using (true);

drop policy if exists "Public can insert rsvps" on public.rsvps;
create policy "Public can insert rsvps" on public.rsvps for insert with check (true);

drop policy if exists "Public can update rsvps" on public.rsvps;
create policy "Public can update rsvps" on public.rsvps for update using (true);

-- Profiles Policies
drop policy if exists "Public can view profiles" on public.profiles;
create policy "Public can view profiles" on public.profiles for select using (true);

drop policy if exists "Public can manage profiles" on public.profiles;
create policy "Public can manage profiles" on public.profiles for all using (true);

-- Comments Policies
drop policy if exists "Public can read comments" on public.comments;
create policy "Public can read comments" on public.comments for select using (true);

drop policy if exists "Public can insert comments" on public.comments;
create policy "Public can insert comments" on public.comments for insert with check (true);

-- 8. REALTIME REPLICATION
do $$
begin
  begin alter publication supabase_realtime add table public.events; exception when others then null; end;
  begin alter publication supabase_realtime add table public.rsvps; exception when others then null; end;
  begin alter publication supabase_realtime add table public.comments; exception when others then null; end;
end $$;

-- ==========================================================
-- 9. SEED INITIAL CURATED GATHERINGS DIRECTLY INTO SUPABASE
-- ==========================================================

-- Event 1: Bengaluru AI Salon
insert into public.events (
  id,
  title,
  slug,
  tagline,
  description,
  category,
  theme_template,
  start_time,
  end_time,
  location,
  venue_name,
  is_virtual,
  capacity,
  approval_required,
  status,
  cover_url,
  sections,
  custom_questions
) values (
  'b1000000-0000-0000-0000-000000000001',
  'Bengaluru AI Founders & Builders Salon',
  'bengaluru-ai-founders-salon',
  'An intimate evening of deep-tech demos and fireside discussions in Indiranagar',
  'Join 40 of Bengaluru’s top AI engineers, researchers, and founders for a private dinner and lightning demo salon. We will explore frontier multimodal models, agentic workflows, and the next wave of Indian AI startups building for global scale. Filter coffee, craft cocktails, and curated dinner included.',
  'Technology',
  'Sprint',
  now() + interval '5 days',
  now() + interval '5 days 4 hours',
  '12th Main Rd, Indiranagar, Bengaluru, Karnataka',
  'The Greenhouse Terrace, Indiranagar',
  false,
  45,
  true,
  'published',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  '{"speakers":[{"name":"Arjun Nambiar","role":"Co-founder & CTO","company":"Kavach AI","bio":"Building open-weights agent frameworks for enterprise autonomy."},{"name":"Pooja Sundaram","role":"Principal Partner","company":"Parampara Ventures","bio":"Investing in seed-stage Indian deep tech and robotics."}],"agenda":[{"time":"7:00 PM","title":"Welcome Drinks & Filter Coffee Mingling"},{"time":"7:45 PM","title":"Curated 5-Minute Lightning Demos"},{"time":"8:30 PM","title":"Fireside: The Next 3 Years of Enterprise AI"},{"time":"9:15 PM","title":"Family-Style Rooftop Dinner"}],"faq":[{"question":"Is approval required?","answer":"Yes, this is an intimate dinner capped at 45 attendees. We review applications daily."}]}',
  '[{"id":"q1","label":"What AI project or company are you currently building?","type":"text","required":true},{"id":"q2","label":"LinkedIn or Twitter profile link","type":"text","required":true}]'
) on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  tagline = excluded.tagline,
  cover_url = excluded.cover_url,
  sections = excluded.sections;

-- Event 2: Mumbai Acoustic Sundowner
insert into public.events (
  id,
  title,
  slug,
  tagline,
  description,
  category,
  theme_template,
  start_time,
  end_time,
  location,
  venue_name,
  is_virtual,
  capacity,
  approval_required,
  status,
  cover_url,
  sections,
  custom_questions
) values (
  'b1000000-0000-0000-0000-000000000002',
  'Bandra Sunset Acoustic & Poetry Sundowner',
  'mumbai-sunset-acoustic-sundowner',
  'Warm golden hour chords overlooking the Arabian Sea',
  'An unplugged twilight gathering featuring 4 independent singer-songwriters from Mumbai, spoken word poets, and woodfired sourdough pizzas on a private Bandra seafront terrace. Bring your warmest vibe and stories.',
  'Music & Arts',
  'Ember',
  now() + interval '8 days',
  now() + interval '8 days 3 hours',
  'Carter Road, Bandra West, Mumbai, Maharashtra',
  'Sea Breeze Rooftop Salon',
  false,
  60,
  false,
  'published',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  '{"speakers":[{"name":"Kabir Varma","role":"Folk-Acoustic Singer","company":"Independent Artist","bio":"Trained in Hindustani classical guitar & fingerstyle melodies."}],"agenda":[{"time":"5:30 PM","title":"Sunset Arrival & Welcome Spiced Chai"},{"time":"6:15 PM","title":"Acoustic Set 1: Kabir Varma"},{"time":"7:15 PM","title":"Spoken Word Interlude"},{"time":"8:00 PM","title":"Community Jam & Woodfired Pizzas"}],"faq":[{"question":"Can I bring a plus one?","answer":"Yes! Please indicate in the RSVP form so we can plan catering."}]}',
  '[{"id":"q1","label":"Favorite independent artist or poet?","type":"text","required":false}]'
) on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  tagline = excluded.tagline,
  cover_url = excluded.cover_url;

-- Event 3: Old Delhi Heritage Dinner
insert into public.events (
  id,
  title,
  slug,
  tagline,
  description,
  category,
  theme_template,
  start_time,
  end_time,
  location,
  venue_name,
  is_virtual,
  capacity,
  approval_required,
  status,
  cover_url,
  sections,
  custom_questions
) values (
  'b1000000-0000-0000-0000-000000000003',
  'Old Delhi Heritage & Modern Typography Dinner',
  'delhi-design-craft-dinner',
  'Preserving Urdu calligraphy and reimagining Indian digital design',
  'A culinary and visual journey inside a restored Haveli in Old Delhi. Master calligraphers meet contemporary product designers to bridge centuries of Indian lettering with modern web aesthetics. Multi-course Mughlai & vegan tasting menu included.',
  'Design & Culture',
  'Grove',
  now() + interval '12 days',
  now() + interval '12 days 4 hours',
  'Chandni Chowk, Old Delhi, Delhi NCR',
  'Haveli Dharampura, Old Delhi',
  false,
  35,
  true,
  'published',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
  '{"agenda":[{"time":"7:00 PM","title":"Haveli Rooftop Sherbet & Welcome"},{"time":"7:45 PM","title":"Live Demonstration: Calligraphy on Rice Paper"},{"time":"8:30 PM","title":"Seven-Course Tasting Dinner"}],"faq":[]}',
  '[{"id":"q1","label":"Dietary preferences (Veg / Non-Veg / Vegan)?","type":"text","required":true}]'
) on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  tagline = excluded.tagline;

-- Event 4: Goa Oceanfront Workation Mixer
insert into public.events (
  id,
  title,
  slug,
  tagline,
  description,
  category,
  theme_template,
  start_time,
  end_time,
  location,
  venue_name,
  is_virtual,
  capacity,
  approval_required,
  status,
  cover_url,
  sections,
  custom_questions
) values (
  'b1000000-0000-0000-0000-000000000004',
  'Goa Twilight Oceanfront Founders Mixer',
  'goa-founders-workation-mixer',
  'Barefoot strategy and cold brews by the Mandovi backwaters',
  'A casual weekend kickoff for founders, operators, and remote creators spending the season in Goa. High-signal conversations, artisanal kombuchas, and acoustic vinyl records as the sun dips into the sea.',
  'Networking',
  'Bloom',
  now() + interval '15 days',
  now() + interval '15 days 4 hours',
  'Ashvem Beach Rd, Mandrem, North Goa',
  'Palm Grove Beach Sanctuary, Ashvem',
  false,
  50,
  false,
  'published',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  '{}',
  '[]'
) on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug;

-- ==========================================================
-- 10. SEED SAMPLE RSVPS FOR GUEST PASSES & COUNTERS
-- ==========================================================

-- Priya Sharma's Confirmed RSVP for Bengaluru AI Salon
insert into public.rsvps (
  event_id,
  guest_name,
  guest_email,
  phone,
  status
) values (
  'b1000000-0000-0000-0000-000000000001',
  'Priya Sharma',
  'priya.sharma@techfest.in',
  '+91 98450 12345',
  'confirmed'
) on conflict (event_id, guest_email) do update set
  status = 'confirmed';

-- Priya Sharma's Confirmed RSVP for Mumbai Acoustic Sundowner
insert into public.rsvps (
  event_id,
  guest_name,
  guest_email,
  phone,
  status
) values (
  'b1000000-0000-0000-0000-000000000002',
  'Priya Sharma',
  'priya.sharma@techfest.in',
  '+91 98450 12345',
  'confirmed'
) on conflict (event_id, guest_email) do update set
  status = 'confirmed';

-- Additional attendees for Bengaluru AI Salon
insert into public.rsvps (event_id, guest_name, guest_email, status)
values
  ('b1000000-0000-0000-0000-000000000001', 'Rohan Mehta', 'rohan@kavach.ai', 'confirmed'),
  ('b1000000-0000-0000-0000-000000000001', 'Ananya Rao', 'ananya.rao@matrix.vc', 'confirmed'),
  ('b1000000-0000-0000-0000-000000000001', 'Karan Patel', 'karan@frontierlabs.io', 'confirmed')
on conflict do nothing;

-- Verification query
select 'Setup completed successfully!' as result, count(*) as total_events from public.events;
