import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== VERIFYING SCHEMA ALIGNMENT & QUERIES ===');
console.log('Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  // 1. Test events query using exact columns
  console.log('\n[1] Testing public.events query...');
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select(`
      id,
      organizer_id,
      title,
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
      custom_questions,
      created_at
    `)
    .order('start_time', { ascending: true });

  if (eventsError) {
    console.error('❌ events query error:', eventsError);
  } else {
    console.log(`✅ events query success! Count: ${events.length}`);
    if (events.length > 0) {
      console.log('Sample event row:', {
        id: events[0].id,
        title: events[0].title,
        start_time: events[0].start_time,
        end_time: events[0].end_time,
        status: events[0].status,
        theme_template: events[0].theme_template,
      });
    }
  }

  // 2. Test rsvps join with events
  console.log('\n[2] Testing public.rsvps joined with public.events query...');
  const { data: rsvpsWithEvent, error: rsvpError } = await supabase
    .from('rsvps')
    .select(`
      id,
      event_id,
      user_id,
      guest_name,
      guest_email,
      status,
      answers,
      created_at,
      event:events(
        id,
        title,
        description,
        start_time,
        end_time,
        location,
        venue_name,
        cover_url,
        status
      )
    `)
    .limit(5);

  if (rsvpError) {
    console.error('❌ rsvps joined query error:', rsvpError);
  } else {
    console.log(`✅ rsvps joined query success! Count: ${rsvpsWithEvent.length}`);
    if (rsvpsWithEvent.length > 0) {
      console.log('Sample RSVP with joined event:', {
        rsvp_id: rsvpsWithEvent[0].id,
        guest_name: rsvpsWithEvent[0].guest_name,
        event_title: rsvpsWithEvent[0].event?.title,
        start_time: rsvpsWithEvent[0].event?.start_time,
      });
    }
  }

  // 3. Test non-existent columns are NOT queried
  console.log('\n[3] Testing safety: Verify that querying non-existent columns (e.g. slug) fails as expected...');
  const { error: badColError } = await supabase
    .from('events')
    .select('id, slug')
    .limit(1);

  if (badColError && badColError.code === '42703') {
    console.log('✅ Confirmed: events.slug does NOT exist (42703). Code must NOT query events.slug in SQL.');
  } else if (!badColError) {
    console.log('ℹ️ slug column exists? No error returned.');
  } else {
    console.log('Query result:', badColError);
  }

  console.log('\n=== SCHEMA ALIGNMENT VERIFICATION COMPLETE ===');
}

testQueries().catch(console.error);
