import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EventItem } from '@/types/database';
import { persistLocalEvent } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      theme_template,
      start_time,
      end_time,
      start_at,
      end_at,
      location,
      venue_name,
      location_name,
      location_address,
      is_virtual,
      capacity,
      approval_required,
      status,
      cover_url,
      custom_questions,
      sections,
      organizer_id,
      city,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Event title is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const startTimeIso = start_time || start_at || new Date().toISOString();
    const endTimeIso = end_time || end_at || null;
    const finalVenue = venue_name || location_name || null;
    const finalLocation = location || location_address || 'Bengaluru, India';

    // Construct clean payload matching Supabase public.events table columns
    const payload: any = {
      title: title.trim(),
      description: description ? description.trim() : null,
      category: category || 'Gathering',
      theme_template: theme_template || 'Grove',
      start_time: startTimeIso,
      end_time: endTimeIso,
      location: finalLocation,
      venue_name: finalVenue,
      is_virtual: Boolean(is_virtual),
      capacity: typeof capacity === 'number' ? capacity : 50,
      approval_required: Boolean(approval_required),
      status: status === 'live' ? 'published' : (status || 'published'),
      cover_url: cover_url || null,
      custom_questions: Array.isArray(custom_questions) ? custom_questions : [],
    };

    // Only attach organizer_id if it's a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organizer_id || '');
    if (organizer_id && isUUID) {
      payload.organizer_id = organizer_id;
    }

    // 1. Insert directly into Supabase PostgreSQL
    const { data: dbEvent, error: dbError } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (dbError) {
      console.warn('[Supabase Event Insert Warning]:', dbError.message);
      return NextResponse.json(
        {
          success: false,
          error: dbError.message,
          code: dbError.code,
          hint: dbError.code === '42501' 
            ? 'Supabase Row Level Security (RLS) is blocking inserts. Please run the SQL policy in Supabase SQL Editor or provide SUPABASE_SERVICE_ROLE_KEY in .env.local.' 
            : dbError.message,
        },
        { status: 400 }
      );
    }

    // Cache locally as backup
    persistLocalEvent(dbEvent as EventItem);

    return NextResponse.json({
      success: true,
      event: dbEvent,
      id: dbEvent.id,
    });
  } catch (err: any) {
    console.error('[API Events Publish Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
