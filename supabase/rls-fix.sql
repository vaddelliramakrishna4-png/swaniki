-- ==============================================================================
-- VIBE BY SWANIKI — RLS (Row Level Security) & Schema Alignment Fix
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Ensure RLS is enabled on both tables
alter table public.events enable row level security;
alter table public.rsvps enable row level security;

-- 2. Drop existing policies to prevent conflicts on re-execution
drop policy if exists "Public events are viewable by everyone" on public.events;
drop policy if exists "Organizers can insert their own events" on public.events;
drop policy if exists "Organizers can update their own events" on public.events;
drop policy if exists "Anyone can insert an event" on public.events;

drop policy if exists "Guests can view their own RSVPs" on public.rsvps;
drop policy if exists "Anyone can insert an RSVP" on public.rsvps;
drop policy if exists "Public can submit RSVPs" on public.rsvps;
drop policy if exists "Organizers can view RSVPs for their events" on public.rsvps;
drop policy if exists "Users can view own RSVPs" on public.rsvps;

-- 3. Events Policies:
-- Anyone (including public/guests) can view published events, and organizers can view their own
create policy "Public events are viewable by everyone"
on public.events for select
using (status = 'published' or auth.uid() = organizer_id);

-- Organizers and hosts can insert events
create policy "Organizers can insert their own events"
on public.events for insert
with check (true);

-- Organizers can update their own events
create policy "Organizers can update their own events"
on public.events for update
using (auth.uid() = organizer_id);

-- Organizers can delete their own events
create policy "Organizers can delete their own events"
on public.events for delete
using (auth.uid() = organizer_id);

-- 4. RSVPs Policies:
-- Guests can view their own RSVPs (matching their user_id or auth email)
create policy "Guests can view their own RSVPs"
on public.rsvps for select
using (
  auth.uid() = user_id 
  or guest_email = (select email from auth.users where id = auth.uid())
);

-- Anyone can submit an RSVP
create policy "Anyone can insert an RSVP"
on public.rsvps for insert
with check (true);

-- Guests can update/cancel their own RSVPs
create policy "Guests can update their own RSVPs"
on public.rsvps for update
using (
  auth.uid() = user_id 
  or guest_email = (select email from auth.users where id = auth.uid())
);

-- Organizers can view all RSVPs registered for their own events
create policy "Organizers can view RSVPs for their events"
on public.rsvps for select
using (
  exists (
    select 1 from public.events
    where events.id = rsvps.event_id
    and events.organizer_id = auth.uid()
  )
);
