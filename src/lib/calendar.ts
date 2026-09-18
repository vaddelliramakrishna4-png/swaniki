import { EventItem } from '@/types/database';

function formatUtcForIcs(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate standard RFC 5545 compliant iCalendar (.ics) content.
 */
export function generateICSContent(event: EventItem): string {
  const startDate = event.start_time ? new Date(event.start_time) : new Date(Date.now() + 86400000);
  const endDate = event.end_time
    ? new Date(event.end_time)
    : new Date(startDate.getTime() + 3 * 3600000); // 3-hour default duration

  const dtStart = formatUtcForIcs(startDate);
  const dtEnd = formatUtcForIcs(endDate);
  const dtStamp = formatUtcForIcs(new Date());
  const uid = `vibe-${event.id || 'event'}-${startDate.getTime()}@vibe.swaniki.com`;

  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;
  const location = event.is_virtual
    ? 'Virtual Gathering (Link available on event page)'
    : event.venue_name
    ? `${event.venue_name}, ${event.location || ''}`.trim()
    : event.location || 'India';

  const description = [
    event.tagline || '',
    event.description || '',
    '',
    `Event Details & RSVP: ${eventUrl}`,
    `Host: ${event.organizer_name || 'Swaniki Host'}`,
  ]
    .filter((line) => line !== null && line !== undefined)
    .join('\n')
    .trim();

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Swaniki//Vibe Gatherings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title || 'Gathering')}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${eventUrl}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generate one-click Google Calendar URL.
 */
export function getGoogleCalendarUrl(event: EventItem): string {
  const startDate = event.start_time ? new Date(event.start_time) : new Date(Date.now() + 86400000);
  const endDate = event.end_time
    ? new Date(event.end_time)
    : new Date(startDate.getTime() + 3 * 3600000);

  const dtStart = formatUtcForIcs(startDate);
  const dtEnd = formatUtcForIcs(endDate);

  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;
  const location = event.is_virtual
    ? 'Virtual Gathering'
    : event.venue_name
    ? `${event.venue_name}, ${event.location || ''}`.trim()
    : event.location || 'India';

  const details = [
    event.tagline || '',
    event.description || '',
    '',
    `RSVP & Event Page: ${eventUrl}`,
    `Curated by: ${event.organizer_name || 'Swaniki Collective'}`,
  ]
    .join('\n')
    .trim();

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Exclusive Gathering',
    dates: `${dtStart}/${dtEnd}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Client-side helper to trigger direct browser download of .ics file.
 */
export function downloadICSFile(event: EventItem) {
  if (typeof window === 'undefined') return;

  const content = generateICSContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${(event.slug || event.id || 'gathering').toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
