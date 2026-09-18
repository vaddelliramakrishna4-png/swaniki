import { NextRequest, NextResponse } from 'next/server';
import { submitRSVPRecord, fetchEventRSVPs, fetchEventById } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event_id = body.event_id || body.eventId;
    const guest_name = body.guest_name || body.guestName;
    const guest_email = body.guest_email || body.guestEmail;
    const phone = body.phone || body.answers?.phone;
    const answers = body.answers;
    const status = body.status;
    const user_id = body.user_id || body.userId;

    if (!event_id || !guest_name || !guest_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required RSVP fields (event_id, guest_name, guest_email)' },
        { status: 400 }
      );
    }

    const event = await fetchEventById(event_id);
    let targetStatus = status || 'confirmed';

    if (event && event.capacity > 0) {
      const currentRsvps = await fetchEventRSVPs(event.id);
      if (currentRsvps.length >= event.capacity) {
        targetStatus = 'waitlisted';
      }
    }

    const result = await submitRSVPRecord({
      event_id: event?.id || event_id,
      guest_name,
      guest_email,
      phone,
      status: targetStatus,
      answers,
      user_id,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Missing eventId query param' }, { status: 400 });
    }

    const rsvps = await fetchEventRSVPs(eventId);
    return NextResponse.json({ success: true, rsvps, count: rsvps.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
