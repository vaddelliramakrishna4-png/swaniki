import { NextRequest, NextResponse } from 'next/server';
import { fetchEventById, fetchEvents } from '@/lib/events';
import {
  renderRSVPConfirmedEmail,
  renderRSVPWaitlistedEmail,
  renderEventReminder24hEmail,
  renderEventReminder1hEmail,
  renderEventUpdatedEmail,
  renderEventCancelledEmail,
  renderNewEventFollowerEmail,
  EmailBranding,
} from '@/emails/templates';
import { EventItem } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const template = searchParams.get('template') || 'confirmed';
    const eventId = searchParams.get('eventId');
    const brandColor = searchParams.get('brandColor') || '#1A1A2E';
    const organizerName = searchParams.get('organizerName') || 'Swaniki Collective';
    const logoUrl = searchParams.get('logoUrl') || undefined;

    let event: EventItem | null = null;
    if (eventId) {
      event = await fetchEventById(eventId);
    }
    if (!event) {
      const all = await fetchEvents();
      event = all[0] || {
        id: 'sample-salon',
        title: 'Indiranagar AI & Creative Technology Salon',
        tagline: 'High-signal dinner & discussions with leading AI builders',
        description: 'An intimate evening uniting machine learning researchers, indie founders, and creative technologists.',
        category: 'Tech & AI',
        theme_template: 'Grove',
        start_time: '2026-09-18T19:00:00+05:30',
        end_time: '2026-09-18T22:30:00+05:30',
        location: '12th Main, Indiranagar, Bengaluru, Karnataka',
        venue_name: 'The Glasshouse Courtyard',
        is_virtual: false,
        capacity: 40,
        approval_required: false,
        status: 'published',
        cover_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
        custom_questions: [],
        organizer_name: 'Swaniki Collective',
        city: 'Bengaluru',
      };
    }

    const branding: EmailBranding = {
      brandColor,
      organizerName,
      logoUrl,
    };

    let result: { subject: string; html: string };

    switch (template) {
      case 'waitlisted':
        result = renderRSVPWaitlistedEmail(event, 'Vikramaditya Roy', branding);
        break;
      case 'reminder24h':
        result = renderEventReminder24hEmail(event, 'Aarav Patel', branding);
        break;
      case 'reminder1h':
        result = renderEventReminder1hEmail(event, 'Meera Iyer', branding);
        break;
      case 'updated':
        result = renderEventUpdatedEmail(
          event,
          'Dr. Radhika Sen',
          'Venue moved to Private Courtyard upstairs due to weather.',
          branding
        );
        break;
      case 'cancelled':
        result = renderEventCancelledEmail(
          event,
          'Kabir Varma',
          'We have received your cancellation request and released your seat to the waitlist.',
          branding
        );
        break;
      case 'new_event':
        result = renderNewEventFollowerEmail(event, organizerName, branding);
        break;
      case 'confirmed':
      default:
        result = renderRSVPConfirmedEmail(event, 'Siddharth Nair', branding);
        break;
    }

    return new NextResponse(result.html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error rendering email preview: ${err.message}`, { status: 500 });
  }
}
