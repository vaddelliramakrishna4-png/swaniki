import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { EventItem } from '@/types/database';
import { LOCAL_CREATED_EVENTS } from '@/lib/events';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const event: EventItem = await req.json();

    if (!event || (!event.id && !event.slug && !event.title)) {
      return NextResponse.json({ success: false, error: 'Invalid event data' }, { status: 400 });
    }

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.id);
      const payload: any = {
        title: event.title,
        description: event.description || null,
        category: event.category || 'Gathering',
        theme_template: event.theme_template || 'Grove',
        start_time: event.start_time,
        end_time: event.end_time || null,
        location: event.location || 'Bengaluru',
        venue_name: event.venue_name || 'Venue',
        is_virtual: event.is_virtual ?? false,
        capacity: event.capacity ?? 50,
        approval_required: event.approval_required ?? false,
        status: event.status || 'published',
        cover_url: event.cover_url || null,
        custom_questions: event.custom_questions || [],
      };
      if (isUUID) {
        payload.id = event.id;
      }
      if (event.organizer_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.organizer_id)) {
        payload.organizer_id = event.organizer_id;
      }
      
      const { data, error } = await supabase.from('events').upsert([payload], { onConflict: isUUID ? 'id' : undefined }).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, event: data });
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error('Sync route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (!error && data) {
        return NextResponse.json({ success: true, events: data });
      }
    }
    return NextResponse.json({ success: true, events: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
