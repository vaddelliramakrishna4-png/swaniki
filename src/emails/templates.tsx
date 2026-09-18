import { EventItem } from '@/types/database';
import { formatEventTimeRangeIST } from '@/lib/date';
import { getGoogleCalendarUrl } from '@/lib/calendar';

export interface EmailBranding {
  organizerName?: string;
  logoUrl?: string;
  brandColor?: string; // e.g. '#1A1A2E' or '#14382A'
}

export type EmailTemplateType =
  | 'confirmed'
  | 'waitlisted'
  | 'reminder24h'
  | 'reminder1h'
  | 'updated'
  | 'cancelled'
  | 'new_event';

function renderEmailLayout({
  branding,
  subject,
  headerBadge,
  heading,
  subheading,
  contentHtml,
  ctaText,
  ctaUrl,
  secondaryCtaText,
  secondaryCtaUrl,
  footerNote,
}: {
  branding: EmailBranding;
  subject: string;
  headerBadge?: string;
  heading: string;
  subheading?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footerNote?: string;
}): string {
  const brandColor = branding.brandColor || '#1A1A2E';
  const organizerName = branding.organizerName || 'Vibe Host';
  const logoUrl = branding.logoUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F7F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F0F0F;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F7F4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E8E4DF; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          
          <!-- White-Labeled Header Strip -->
          <tr>
            <td style="background-color: ${brandColor}; padding: 24px 32px; border-bottom: 2px solid #C9A84C;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    ${
                      logoUrl
                        ? `<img src="${logoUrl}" alt="${organizerName}" height="36" style="display: block; border-radius: 6px; max-width: 140px; object-fit: contain;" />`
                        : `<div style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 10px; background-color: #C9A84C; color: #1A1A2E; font-weight: bold; font-size: 16px;">${organizerName.slice(0, 2).toUpperCase()}</div>`
                    }
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C9A84C; font-weight: bold;">
                      ${organizerName}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              ${
                headerBadge
                  ? `<div style="display: inline-block; padding: 4px 12px; border-radius: 999px; background-color: #FEF0E7; color: #E8621A; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px;">${headerBadge}</div>`
                  : ''
              }
              
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #1A1A2E; line-height: 1.25;">
                ${heading}
              </h1>

              ${
                subheading
                  ? `<p style="margin: 0 0 24px 0; font-size: 15px; color: #4B4B4B; line-height: 1.5; font-style: italic;">${subheading}</p>`
                  : '<div style="height: 16px;"></div>'
              }

              <!-- Body Injection -->
              <div style="font-size: 14px; line-height: 1.6; color: #4B4B4B;">
                ${contentHtml}
              </div>

              <!-- Action CTAs -->
              ${
                ctaText && ctaUrl
                  ? `
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                  <tr>
                    <td align="left">
                      <a href="${ctaUrl}" style="display: inline-block; background-color: #E8621A; color: #FFFFFF; font-size: 13px; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; box-shadow: 0 2px 6px rgba(232,98,26,0.3);">
                        ${ctaText}
                      </a>
                      ${
                        secondaryCtaText && secondaryCtaUrl
                          ? `
                        <a href="${secondaryCtaUrl}" style="display: inline-block; margin-left: 12px; background-color: #F0EDE8; color: #1A1A2E; font-size: 13px; font-weight: 600; padding: 12px 20px; border-radius: 10px; text-decoration: none; border: 1px solid #C8C4BF;">
                          ${secondaryCtaText}
                        </a>
                      `
                          : ''
                      }
                    </td>
                  </tr>
                </table>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer Logistics & Brand Notice -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F9F7F4; border-top: 1px solid #E8E4DF; font-size: 12px; color: #8A8A8A; line-height: 1.5;">
              ${footerNote ? `<p style="margin: 0 0 12px 0;">${footerNote}</p>` : ''}
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 11px; color: #8A8A8A;">
                    Powered by <strong style="color: #1A1A2E;">Vibe by Swaniki</strong> · India-first curated gathering engine
                  </td>
                  <td align="right" style="font-size: 11px; color: #C9A84C; font-weight: bold;">
                    ✦ HIGH SIGNAL
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function renderEventInfoBox(event: EventItem, timeStr: string, venueStr: string): string {
  return `
    <div style="margin: 20px 0; padding: 18px; border-radius: 12px; background-color: #F9F7F4; border: 1px solid #E8E4DF;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 10px;">
            <span style="font-size: 11px; font-weight: bold; color: #8A8A8A; text-transform: uppercase;">When (IST)</span>
            <div style="font-size: 14px; font-weight: bold; color: #1A1A2E; margin-top: 2px;">
              🗓 ${timeStr}
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <span style="font-size: 11px; font-weight: bold; color: #8A8A8A; text-transform: uppercase;">Location</span>
            <div style="font-size: 14px; font-weight: bold; color: #1A1A2E; margin-top: 2px;">
              🏛 ${venueStr}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * 1. RSVP Confirmed Email
 */
export function renderRSVPConfirmedEmail(
  event: EventItem,
  guestName: string,
  branding: EmailBranding = {}
): { subject: string; html: string } {
  const timeStr = formatEventTimeRangeIST(event.start_time, event.end_time);
  const venueStr = event.venue_name ? `${event.venue_name}, ${event.location || ''}` : event.location || 'India';
  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;
  const googleCalUrl = getGoogleCalendarUrl(event);
  const icsUrl = `https://vibe-by-swaniki.vercel.app/api/events/${event.id}/ics`;
  const guestPortalUrl = `https://vibe-by-swaniki.vercel.app/guest`;

  const subject = `Confirmed: You're attending ${event.title}!`;
  const contentHtml = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>Your spot has been confirmed for <strong>${event.title}</strong>! The host is excited to welcome you.</p>
    ${renderEventInfoBox(event, timeStr, venueStr)}
    <p>Please arrive 10-15 minutes early to settle in. We recommend adding the gathering to your calendar now so you don't miss it:</p>
    <div style="margin: 16px 0;">
      <a href="${googleCalUrl}" target="_blank" style="display: inline-block; padding: 8px 16px; border-radius: 8px; background-color: #1A1A2E; color: #FFFFFF; font-size: 12px; font-weight: bold; text-decoration: none; margin-right: 8px;">
        + Google Calendar
      </a>
      <a href="${icsUrl}" download style="display: inline-block; padding: 8px 16px; border-radius: 8px; background-color: #F0EDE8; color: #1A1A2E; font-size: 12px; font-weight: bold; text-decoration: none; border: 1px solid #C8C4BF;">
        Download .ICS
      </a>
    </div>
    <p style="font-size: 12px; color: #8A8A8A; margin-top: 20px;">
      Can't make it anymore? Please release your spot so someone on the waitlist can attend: 
      <a href="${guestPortalUrl}" style="color: #E8621A; text-decoration: underline;">Manage or Cancel RSVP</a>.
    </p>
  `;

  const html = renderEmailLayout({
    branding: { ...branding, organizerName: branding.organizerName || event.organizer_name },
    subject,
    headerBadge: 'RSVP Confirmed',
    heading: `You're on the guest list!`,
    subheading: event.tagline || undefined,
    contentHtml,
    ctaText: 'View Event Page',
    ctaUrl: eventUrl,
    secondaryCtaText: 'My Gatherings',
    secondaryCtaUrl: guestPortalUrl,
    footerNote: `Organized by ${branding.organizerName || event.organizer_name || 'Swaniki Collective'}.`,
  });

  return { subject, html };
}

/**
 * 2. Waitlisted Email
 */
export function renderRSVPWaitlistedEmail(
  event: EventItem,
  guestName: string,
  branding: EmailBranding = {}
): { subject: string; html: string } {
  const timeStr = formatEventTimeRangeIST(event.start_time, event.end_time);
  const venueStr = event.venue_name || event.location || 'India';
  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;

  const subject = `Waitlisted: ${event.title}`;
  const contentHtml = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>Thank you for your interest in <strong>${event.title}</strong>. This gathering has reached full capacity, and you have been placed on the priority waitlist.</p>
    ${renderEventInfoBox(event, timeStr, venueStr)}
    <p>If an existing attendee cancels their RSVP, spots open up automatically and we will notify you immediately via email so you can claim your seat.</p>
  `;

  const html = renderEmailLayout({
    branding: { ...branding, organizerName: branding.organizerName || event.organizer_name },
    subject,
    headerBadge: 'Waitlist Notice',
    heading: `You're on the waitlist`,
    subheading: `We'll let you know as soon as a spot becomes available.`,
    contentHtml,
    ctaText: 'View Gathering Details',
    ctaUrl: eventUrl,
  });

  return { subject, html };
}

/**
 * 3. 24h Event Reminder Email
 */
export function renderEventReminder24hEmail(
  event: EventItem,
  guestName: string,
  branding: EmailBranding = {}
): { subject: string; html: string } {
  const timeStr = formatEventTimeRangeIST(event.start_time, event.end_time);
  const venueStr = event.venue_name ? `${event.venue_name}, ${event.location || ''}` : event.location || 'India';
  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;

  const subject = `Reminder: ${event.title} is tomorrow!`;
  const contentHtml = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>Just a quick reminder that <strong>${event.title}</strong> is happening tomorrow! Here are your gathering logistics:</p>
    ${renderEventInfoBox(event, timeStr, venueStr)}
    <p><strong>Quick Checklist:</strong></p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Please arrive on time so we can begin our salon together.</li>
      <li>Smart casual & comfortable attire recommended.</li>
      <li>If you need directions, check the interactive Google Map on the event page.</li>
    </ul>
  `;

  const html = renderEmailLayout({
    branding: { ...branding, organizerName: branding.organizerName || event.organizer_name },
    subject,
    headerBadge: 'Tomorrow in IST',
    heading: `See you tomorrow!`,
    subheading: event.tagline || undefined,
    contentHtml,
    ctaText: 'Open Event Directions',
    ctaUrl: eventUrl,
  });

  return { subject, html };
}

/**
 * 4. 1h Event Reminder Email
 */
export function renderEventReminder1hEmail(
  event: EventItem,
  guestName: string,
  branding: EmailBranding = {}
): { subject: string; html: string } {
  const venueStr = event.venue_name ? `${event.venue_name}, ${event.location || ''}` : event.location || 'India';
  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;

  const subject = `Starting in 1 hour: ${event.title}`;
  const contentHtml = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>Doors are opening soon! <strong>${event.title}</strong> begins in approximately one hour.</p>
    <div style="margin: 20px 0; padding: 16px; border-radius: 12px; background-color: #FEF0E7; border: 1px solid #E8621A;">
      <span style="font-size: 11px; font-weight: bold; color: #E8621A; text-transform: uppercase;">Entrance / Location</span>
      <div style="font-size: 15px; font-weight: bold; color: #1A1A2E; margin-top: 4px;">
        🏛 ${venueStr}
      </div>
    </div>
    <p>Our team and host are ready to welcome you. Travel safe and see you shortly!</p>
  `;

  const html = renderEmailLayout({
    branding: { ...branding, organizerName: branding.organizerName || event.organizer_name },
    subject,
    headerBadge: 'Starting in 1 Hour',
    heading: `Doors open shortly!`,
    contentHtml,
    ctaText: 'View Venue & Info',
    ctaUrl: eventUrl,
  });

  return { subject, html };
}

/**
 * 5. Event Updated Email
 */
export function renderEventUpdatedEmail(
  event: EventItem,
  guestName: string,
  updateNotes: string = 'The host has updated gathering details (timing or venue).',
  branding: EmailBranding = {}
): { subject: string; html: string } {
  const timeStr = formatEventTimeRangeIST(event.start_time, event.end_time);
  const venueStr = event.venue_name ? `${event.venue_name}, ${event.location || ''}` : event.location || 'India';
  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;

  const subject = `Important Update: ${event.title}`;
  const contentHtml = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>The host of <strong>${event.title}</strong> has made an important update to the event details:</p>
    <div style="margin: 16px 0; padding: 14px 18px; border-radius: 10px; background-color: #FDF6E7; border-left: 4px solid #C9A84C; font-size: 14px; color: #78350F; font-weight: 500;">
      "${updateNotes}"
    </div>
    <p><strong>Updated Gathering Logistics:</strong></p>
    ${renderEventInfoBox(event, timeStr, venueStr)}
    <p>Your RSVP remains active. Please review the updated page for full details.</p>
  `;

  const html = renderEmailLayout({
    branding: { ...branding, organizerName: branding.organizerName || event.organizer_name },
    subject,
    headerBadge: 'Update Notice',
    heading: `Event details have been updated`,
    contentHtml,
    ctaText: 'Review Updated Event',
    ctaUrl: eventUrl,
  });

  return { subject, html };
}

/**
 * 6. Event Cancelled / RSVP Cancelled Email
 */
export function renderEventCancelledEmail(
  event: EventItem,
  guestName: string,
  reason: string = 'The gathering has been cancelled or your RSVP has been released.',
  branding: EmailBranding = {}
): { subject: string; html: string } {
  const subject = `RSVP Cancelled: ${event.title}`;
  const contentHtml = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>This email confirms that your RSVP for <strong>${event.title}</strong> has been cancelled and your spot has been released.</p>
    <div style="margin: 16px 0; padding: 14px 18px; border-radius: 10px; background-color: #F9F7F4; border: 1px solid #E8E4DF; color: #4B4B4B;">
      ${reason}
    </div>
    <p>We hope to see you at another upcoming gathering soon!</p>
  `;

  const html = renderEmailLayout({
    branding: { ...branding, organizerName: branding.organizerName || event.organizer_name },
    subject,
    headerBadge: 'Cancellation Notice',
    heading: `RSVP Cancelled`,
    contentHtml,
    ctaText: 'Explore More Gatherings',
    ctaUrl: 'https://vibe-by-swaniki.vercel.app',
  });

  return { subject, html };
}

/**
 * 7. New Event by Followed Host Email
 */
export function renderNewEventFollowerEmail(
  event: EventItem,
  organizerName: string,
  branding: EmailBranding = {}
): { subject: string; html: string } {
  const timeStr = formatEventTimeRangeIST(event.start_time, event.end_time);
  const venueStr = event.venue_name || event.location || 'India';
  const eventUrl = `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;

  const subject = `New Gathering: ${event.title} by ${organizerName}`;
  const contentHtml = `
    <p><strong>${organizerName}</strong> just announced a new curated gathering!</p>
    <div style="margin: 16px 0; border-radius: 12px; overflow: hidden; border: 1px solid #E8E4DF;">
      ${
        event.cover_url
          ? `<img src="${event.cover_url}" alt="${event.title}" width="100%" style="display: block; max-height: 220px; object-fit: cover;" />`
          : ''
      }
      <div style="padding: 18px; background-color: #FFFFFF;">
        <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: bold; color: #1A1A2E;">${event.title}</h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #C9A84C; font-style: italic;">${event.tagline || ''}</p>
        <p style="margin: 0; font-size: 13px; color: #4B4B4B;">${event.description?.slice(0, 160) || ''}...</p>
      </div>
    </div>
    ${renderEventInfoBox(event, timeStr, venueStr)}
    <p>Spots are limited. RSVP early to ensure your entry:</p>
  `;

  const html = renderEmailLayout({
    branding: { ...branding, organizerName },
    subject,
    headerBadge: 'Host Announcement',
    heading: `${organizerName} published a new event`,
    contentHtml,
    ctaText: 'RSVP Now',
    ctaUrl: eventUrl,
  });

  return { subject, html };
}
