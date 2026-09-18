import { NextRequest, NextResponse } from 'next/server';
import { cancelRSVP } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_id, guest_email, reason } = body;

    if (!event_id || !guest_email) {
      return NextResponse.json(
        { error: 'event_id and guest_email are required' },
        { status: 400 }
      );
    }

    const result = await cancelRSVP(event_id, guest_email, reason);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to cancel RSVP' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'RSVP cancelled successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
