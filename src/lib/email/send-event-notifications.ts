/**
 * send-event-notifications.ts
 * Reusable server-side utility for dispatching batch email notifications
 * to all confirmed RSVPed guests when an event is updated or cancelled.
 *
 * Uses the admin Supabase client (service role key) to bypass RLS
 * and safely read the full guest list on the server.
 */

import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { dispatchEventUpdate, dispatchRSVPCancellation } from '@/lib/email-service';
import { EventItem } from '@/types/database';

interface GuestRecord {
  guest_name: string;
  guest_email: string;
}

/**
 * Fetch all confirmed RSVPs for an event using the admin client (bypasses RLS).
 */
async function fetchConfirmedGuests(eventId: string): Promise<GuestRecord[]> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('rsvps')
    .select('guest_name, guest_email')
    .eq('event_id', eventId)
    .eq('status', 'confirmed');

  if (error) {
    console.error('[send-event-notifications] fetchConfirmedGuests error:', error.message);
    return [];
  }

  return (data as GuestRecord[]) || [];
}

/**
 * Notify all confirmed guests that event details have been updated.
 *
 * @param eventId   - UUID of the event
 * @param updatedEvent - The updated EventItem to render in emails
 * @param updateNote  - Optional organizer-written message ("What changed?")
 * @returns Number of emails attempted
 */
export async function notifyGuestsOfUpdate(
  eventId: string,
  updatedEvent: EventItem,
  updateNote?: string
): Promise<{ sent: number; failed: number }> {
  const guests = await fetchConfirmedGuests(eventId);

  if (guests.length === 0) {
    console.log(`[send-event-notifications] No confirmed guests for event ${eventId}. Skipping update emails.`);
    return { sent: 0, failed: 0 };
  }

  const note =
    updateNote?.trim() ||
    'The host has updated the event details (timing, venue, or other information).';

  let sent = 0;
  let failed = 0;

  // Fan out individual emails (keeps email client rate limits safe)
  const results = await Promise.allSettled(
    guests.map((guest) =>
      dispatchEventUpdate(updatedEvent, guest.guest_name, guest.guest_email, note)
    )
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++;
    } else {
      failed++;
      if (result.status === 'rejected') {
        console.error('[send-event-notifications] Update email failed:', result.reason);
      }
    }
  }

  console.log(`[send-event-notifications] Update emails: ${sent} sent, ${failed} failed for event ${eventId}`);
  return { sent, failed };
}

/**
 * Notify all confirmed guests that the event has been cancelled.
 *
 * @param eventId  - UUID of the event
 * @param event    - The cancelled EventItem (used to render the email body)
 * @param reason   - Optional organizer message about the cancellation
 * @returns Number of emails attempted
 */
export async function notifyGuestsOfCancellation(
  eventId: string,
  event: EventItem,
  reason?: string
): Promise<{ sent: number; failed: number }> {
  const guests = await fetchConfirmedGuests(eventId);

  if (guests.length === 0) {
    console.log(`[send-event-notifications] No confirmed guests for event ${eventId}. Skipping cancellation emails.`);
    return { sent: 0, failed: 0 };
  }

  const cancellationReason =
    reason?.trim() ||
    `The organizer has cancelled the event "${event.title}". We hope to see you at another gathering soon!`;

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    guests.map((guest) =>
      dispatchRSVPCancellation(event, guest.guest_name, guest.guest_email, cancellationReason)
    )
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++;
    } else {
      failed++;
      if (result.status === 'rejected') {
        console.error('[send-event-notifications] Cancellation email failed:', result.reason);
      }
    }
  }

  console.log(`[send-event-notifications] Cancellation emails: ${sent} sent, ${failed} failed for event ${eventId}`);
  return { sent, failed };
}
