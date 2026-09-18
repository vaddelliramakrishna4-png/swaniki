import http from 'http';
import { generateICSContent, getGoogleCalendarUrl } from '../src/lib/calendar.ts';
import {
  fetchEventById,
  submitRSVPRecord,
  cancelRSVP,
  fetchGuestRSVPs,
  duplicateEventRecord,
  fetchEvents,
} from '../src/lib/events.ts';
import {
  sendEmail,
  dispatchRSVPConfirmation,
  dispatchRSVPCancellation,
} from '../src/lib/email-service.ts';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer,
          text: buffer.toString('utf-8'),
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('=== STARTING PHASE 5 VERIFICATION ===');

  const allEvents = await fetchEvents();
  const sampleEvent =
    allEvents.find((e) => e.id === 'bengaluru-ai-founders-salon') || allEvents[0];
  if (!sampleEvent) {
    throw new Error('No test events found in workspace');
  }
  const testEventId = sampleEvent.id;

  // 1. Calendar Sync: RFC 5545 & Google Calendar URL
  console.log('\n[1] Testing Calendar Sync (ICS Generation & Google Calendar URL) ...');
  const ics = generateICSContent(sampleEvent);
  console.log('Generated ICS snippet:\n' + ics.split('\r\n').slice(0, 10).join('\n'));
  if (
    !ics.includes('BEGIN:VCALENDAR') ||
    !ics.includes('VERSION:2.0') ||
    !ics.includes('BEGIN:VEVENT') ||
    !ics.includes(sampleEvent.title) ||
    !ics.includes('END:VCALENDAR')
  ) {
    throw new Error('ICS content generation failed RFC 5545 validation');
  }

  const gcalUrl = getGoogleCalendarUrl(sampleEvent);
  console.log('Google Calendar URL:', gcalUrl.slice(0, 80) + '...');
  if (!gcalUrl.includes('calendar.google.com') || !gcalUrl.includes('action=TEMPLATE')) {
    throw new Error('Google Calendar URL generation failed');
  }

  // 2. ICS HTTP Endpoint: /api/events/[id]/ics
  console.log(`\n[2] Testing ICS HTTP Endpoint /api/events/${testEventId}/ics ...`);
  const icsRes = await fetchUrl(`http://localhost:3000/api/events/${testEventId}/ics`);
  console.log(`ICS HTTP Response: Status = ${icsRes.statusCode}, Content-Type = ${icsRes.headers['content-type']}`);
  if (
    icsRes.statusCode !== 200 ||
    !icsRes.headers['content-type']?.includes('text/calendar') ||
    !icsRes.headers['content-disposition']?.includes('attachment')
  ) {
    throw new Error('ICS HTTP route failed');
  }

  // 3. Guest RSVP & Cancellation Flow
  console.log('\n[3] Testing Guest RSVP & Cancellation Flow ...');
  const testGuestEmail = 'kavya.rao@designfoundry.in';
  const rsvpSubmit = await submitRSVPRecord({
    event_id: testEventId,
    guest_name: 'Kavya Rao',
    guest_email: testGuestEmail,
    phone: '+91 98333 44556',
    status: 'confirmed',
    answers: { phone: '+91 98333 44556', plus_one: false },
  });
  console.log('RSVP Submission result:', rsvpSubmit.status);

  const guestPasses = await fetchGuestRSVPs(testGuestEmail);
  console.log(`Guest passes found for ${testGuestEmail}: ${guestPasses.length}`);
  if (guestPasses.length === 0) {
    throw new Error('Guest RSVP lookup failed');
  }

  // Cancel the RSVP
  console.log('Cancelling RSVP for', testGuestEmail);
  const cancelRes = await cancelRSVP(testEventId, testGuestEmail, 'Schedule conflict');
  console.log('Cancel result:', cancelRes);
  if (!cancelRes.success) throw new Error('RSVP cancellation failed');

  const guestPassesAfter = await fetchGuestRSVPs(testGuestEmail);
  const cancelledPass = guestPassesAfter.find((p) => p.rsvp.guest_email === testGuestEmail);
  console.log('Status of cancelled pass:', cancelledPass?.rsvp.status);
  if (cancelledPass?.rsvp.status !== 'cancelled') {
    throw new Error('RSVP status was not updated to cancelled');
  }

  // Test POST /api/events/rsvp/cancel endpoint
  console.log('Testing POST /api/events/rsvp/cancel endpoint ...');
  const postCancelRes = await fetchUrl('http://localhost:3000/api/events/rsvp/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: testEventId,
      guest_email: testGuestEmail,
      reason: 'Testing API cancellation endpoint',
    }),
  });
  console.log(`POST /api/events/rsvp/cancel Status: ${postCancelRes.statusCode}`);
  if (postCancelRes.statusCode !== 200) {
    throw new Error('HTTP POST cancel endpoint failed');
  }

  // 4. White-Labeled Email Suite (Resend & Preview API)
  console.log('\n[4] Testing White-Labeled Email Suite (All 7 Templates) ...');
  const templates = [
    'confirmed',
    'waitlisted',
    'reminder24h',
    'reminder1h',
    'updated',
    'cancelled',
    'new_event',
  ];

  for (const t of templates) {
    const previewRes = await fetchUrl(
      `http://localhost:3000/api/emails/preview?template=${t}&brandColor=%2314382A&organizerName=Botanical%20Salons`
    );
    console.log(`Email Template [${t}]: Status = ${previewRes.statusCode}, Length = ${previewRes.text.length}`);
    if (
      previewRes.statusCode !== 200 ||
      !previewRes.text.includes('Botanical Salons') ||
      !previewRes.text.includes('#14382A')
    ) {
      throw new Error(`Email template ${t} failed preview or branding check`);
    }
  }

  // Test email service dispatch in sandbox
  const dispatchTest = await sendEmail({
    to: 'test@example.com',
    subject: 'Verification Test',
    html: '<p>Test</p>',
  });
  console.log('Email dispatch test in sandbox:', dispatchTest);
  if (!dispatchTest.success) throw new Error('Email dispatch service failed');

  // 5. Organizer Dashboard Features: Duplication & Update
  console.log('\n[5] Testing Organizer Dashboard Duplication & Event Management ...');
  const dupRes = await duplicateEventRecord(testEventId);
  console.log('Duplication result: Success =', dupRes.success, 'New Title =', dupRes.event?.title, 'New Slug =', dupRes.event?.slug);
  if (!dupRes.success || !dupRes.event?.title.includes('(Copy)')) {
    throw new Error('Event duplication failed');
  }

  // 6. Verify Web Routes
  console.log('\n[6] Testing Web Routes (/guest and /manage) ...');
  const guestPage = await fetchUrl('http://localhost:3000/guest');
  console.log(`Guest Dashboard /guest: Status = ${guestPage.statusCode}`);
  if (guestPage.statusCode !== 200 || guestPage.text.length < 500) {
    throw new Error('Guest dashboard page failed to render');
  }

  const managePage = await fetchUrl('http://localhost:3000/manage');
  console.log(`Organizer Dashboard /manage: Status = ${managePage.statusCode}`);
  if (managePage.statusCode !== 200 || managePage.text.length < 500) {
    throw new Error('Organizer dashboard page failed to render');
  }

  console.log('\n=== ALL PHASE 5 VERIFICATION CHECKS PASSED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('\nVerification Error:', err);
  process.exit(1);
});
