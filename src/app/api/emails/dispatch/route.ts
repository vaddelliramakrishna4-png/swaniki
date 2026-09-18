import { NextRequest, NextResponse } from 'next/server';
import {
  dispatchRSVPConfirmation,
  dispatchWaitlistNotification,
  dispatch24hReminder,
  dispatch1hReminder,
  dispatchEventUpdate,
  dispatchRSVPCancellation,
} from '@/lib/email-service';
import { fetchEventById } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, eventId, event, guestName, guestEmail, reason, updateNotes, branding } = body;

    const targetEvent = event || (eventId ? await fetchEventById(eventId) : null);
    if (!targetEvent || !guestEmail) {
      return NextResponse.json({ success: false, error: 'Missing event or guestEmail' }, { status: 400 });
    }

    let result;
    if (type === 'confirmation') {
      result = await dispatchRSVPConfirmation(targetEvent, guestName || 'Guest', guestEmail, branding);
    } else if (type === 'waitlist') {
      result = await dispatchWaitlistNotification(targetEvent, guestName || 'Guest', guestEmail, branding);
    } else if (type === 'cancellation') {
      result = await dispatchRSVPCancellation(targetEvent, guestName || 'Guest', guestEmail, reason, branding);
    } else if (type === 'update') {
      result = await dispatchEventUpdate(targetEvent, guestName || 'Guest', guestEmail, updateNotes, branding);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid dispatch type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Email dispatch error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
