import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { mapDbRowToEvent } from '@/lib/events';
import {
  notifyGuestsOfUpdate,
  notifyGuestsOfCancellation,
} from '@/lib/email/send-event-notifications';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Attempt to resolve the calling user's ID from the Authorization header. */
async function resolveCallerId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase.auth.getUser(token);
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/[id]  — Update an event
// ─────────────────────────────────────────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: eventId } = 'then' in params ? await params : params;

    if (!UUID_RE.test(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Fetch current event to verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // 2. Verify the caller is the organizer (best-effort; falls back if no token)
    const callerId = await resolveCallerId(req);
    if (
      callerId &&
      existing.organizer_id &&
      callerId !== existing.organizer_id
    ) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 3. Parse & validate body
    const body = await req.json();
    const {
      title,
      description,
      start_time,
      end_time,
      location,
      venue_name,
      cover_url,
      theme_template,
      custom_questions,
      notify_guests = true,
      update_note,
    } = body;

    // Build update payload — only include explicitly provided fields
    const dbPayload: Record<string, unknown> = {};
    if (title !== undefined) dbPayload.title = title;
    if (description !== undefined) dbPayload.description = description;
    if (start_time !== undefined) dbPayload.start_time = start_time;
    if (end_time !== undefined) dbPayload.end_time = end_time;
    if (location !== undefined) dbPayload.location = location;
    if (venue_name !== undefined) dbPayload.venue_name = venue_name;
    if (cover_url !== undefined) dbPayload.cover_url = cover_url;
    if (theme_template !== undefined) dbPayload.theme_template = theme_template;
    if (custom_questions !== undefined) dbPayload.custom_questions = custom_questions;

    if (Object.keys(dbPayload).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    // 4. Perform the update
    const { data: updated, error: updateErr } = await supabase
      .from('events')
      .update(dbPayload)
      .eq('id', eventId)
      .select()
      .single();

    if (updateErr) {
      console.error('[PUT /api/events/[id]] Update error:', updateErr.message);
      return NextResponse.json(
        { success: false, error: updateErr.message },
        { status: 400 }
      );
    }

    const updatedEvent = mapDbRowToEvent(updated);

    // 5. Fan-out guest notification emails (non-blocking — don't fail the update if email fails)
    let emailResult = { sent: 0, failed: 0 };
    if (notify_guests) {
      emailResult = await notifyGuestsOfUpdate(eventId, updatedEvent, update_note);
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      emails: emailResult,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PUT /api/events/[id]] Exception:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/events/[id]  — Delete an event and notify all confirmed guests
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: eventId } = 'then' in params ? await params : params;

    if (!UUID_RE.test(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Fetch event to verify it exists and get details for the email
    const { data: existing, error: fetchErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // 2. Verify organizer ownership
    const callerId = await resolveCallerId(req);
    if (
      callerId &&
      existing.organizer_id &&
      callerId !== existing.organizer_id
    ) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const eventToDelete = mapDbRowToEvent(existing);

    // 3. Parse optional body for custom cancellation reason
    let cancellationReason: string | undefined;
    try {
      const body = await req.json();
      cancellationReason = body?.reason;
    } catch {
      // DELETE body is optional
    }

    // 4. Send cancellation emails to all confirmed guests BEFORE deleting
    //    (so we still have RSVPs in DB to query)
    const emailResult = await notifyGuestsOfCancellation(
      eventId,
      eventToDelete,
      cancellationReason
    );

    // 5. Delete the event (FK cascade removes RSVPs, comments, etc.)
    const { error: deleteErr } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteErr) {
      console.error('[DELETE /api/events/[id]] Delete error:', deleteErr.message);
      return NextResponse.json(
        { success: false, error: deleteErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: eventId,
      emails: emailResult,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    console.error('[DELETE /api/events/[id]] Exception:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
