import { NextRequest, NextResponse } from 'next/server';
import { fetchEventById } from '@/lib/events';
import { generateICSContent } from '@/lib/calendar';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = 'then' in params ? await params : params;
    const event = await fetchEventById(resolved.id);

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const icsContent = generateICSContent(event);
    const filename = `${(event.slug || event.id).toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Failed to generate calendar file: ${err.message}`, { status: 500 });
  }
}
