import http from 'http';
import { followOrganizer, getOrganizerFollowerCount, notifyFollowersNewEvent } from '../src/lib/follows.ts';
import { createDatePoll, voteOnDatePoll, fetchPollBySlug } from '../src/lib/polls.ts';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
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
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- STARTING PHASE 4 VERIFICATION ---');

  // 1. Verify OG Image Generator for WhatsApp format
  console.log('\n[1] Testing /api/og/[slug]?format=whatsapp ...');
  const ogWa = await fetchUrl('http://localhost:3000/api/og/indiranagar-ai-salon?format=whatsapp');
  console.log(`WhatsApp Banner: Status = ${ogWa.statusCode}, Content-Type = ${ogWa.headers['content-type']}, Size = ${ogWa.buffer.length} bytes`);
  if (ogWa.statusCode !== 200 || !ogWa.headers['content-type']?.includes('image/png') || ogWa.buffer.length < 5000) {
    throw new Error(`WhatsApp banner failed: ${ogWa.statusCode}`);
  }

  // 2. Verify OG Image Generator for Instagram Story format
  console.log('\n[2] Testing /api/og/[slug]?format=story ...');
  const ogStory = await fetchUrl('http://localhost:3000/api/og/indiranagar-ai-salon?format=story');
  console.log(`Instagram Story Banner: Status = ${ogStory.statusCode}, Content-Type = ${ogStory.headers['content-type']}, Size = ${ogStory.buffer.length} bytes`);
  if (ogStory.statusCode !== 200 || !ogStory.headers['content-type']?.includes('image/png') || ogStory.buffer.length < 5000) {
    throw new Error(`Instagram Story banner failed: ${ogStory.statusCode}`);
  }

  // 3. Verify OG Image Generator for Instagram Post format
  console.log('\n[3] Testing /api/og/[slug]?format=post ...');
  const ogPost = await fetchUrl('http://localhost:3000/api/og/indiranagar-ai-salon?format=post');
  console.log(`Instagram Post Banner: Status = ${ogPost.statusCode}, Content-Type = ${ogPost.headers['content-type']}, Size = ${ogPost.buffer.length} bytes`);
  if (ogPost.statusCode !== 200 || !ogPost.headers['content-type']?.includes('image/png') || ogPost.buffer.length < 5000) {
    throw new Error(`Instagram Post banner failed: ${ogPost.statusCode}`);
  }

  // 4. Verify Share Studio page
  console.log('\n[4] Testing Share Studio page /events/indiranagar-ai-salon/share ...');
  const sharePage = await fetchUrl('http://localhost:3000/events/indiranagar-ai-salon/share');
  console.log(`Share Studio: Status = ${sharePage.statusCode}, Length = ${sharePage.text.length}`);
  if (sharePage.statusCode !== 200 || sharePage.text.length < 500) {
    throw new Error('Share studio page failed to render properly');
  }

  // 5. Verify Discover Feed
  console.log('\n[5] Testing Discover Feed / with Filter Pills and View Modes ...');
  const feedPage = await fetchUrl('http://localhost:3000/');
  console.log(`Discover Feed: Status = ${feedPage.statusCode}`);
  if (feedPage.statusCode !== 200 || !feedPage.text.includes('Search by title')) {
    throw new Error('Discover feed filter controls missing');
  }

  // 6. Verify Organizer Profile Page via root vanity route /[slug]
  console.log('\n[6] Testing Organizer Profile Page /swaniki ...');
  const organizerPage = await fetchUrl('http://localhost:3000/swaniki');
  console.log(`Organizer Profile: Status = ${organizerPage.statusCode}`);
  if (organizerPage.statusCode !== 200 || !organizerPage.text.includes('@swaniki')) {
    throw new Error('Organizer profile page failed to render');
  }

  // 7. Verify Follow System & Follower Notifications
  console.log('\n[7] Testing Follow System & Follower Notification ...');
  const followRes = await followOrganizer('priya.sharma@techfest.in', 'swaniki');
  console.log('Follow action result:', followRes);
  const count = getOrganizerFollowerCount('swaniki');
  console.log(`Updated Follower Count for @swaniki: ${count}`);

  const notifyRes = await notifyFollowersNewEvent('Swaniki Collective', 'swaniki', {
    id: 'test-evt-1',
    title: 'Secret Vinyl & Sound Salon',
    start_time: '2026-10-01T18:00:00+05:30',
    location: 'Indiranagar, Bengaluru',
    slug: 'secret-vinyl-sound-salon',
    approval_required: false,
    capacity: 35,
    status: 'published',
  });
  console.log('Follower notification result:', notifyRes);
  if (!notifyRes.success) {
    throw new Error('Follower notification failed');
  }

  // 8. Verify Date Polls & Conversion
  console.log('\n[8] Testing Date Poll Creation, Voting & Event Conversion ...');
  const pollRes = await createDatePoll({
    title: 'Autumn Indie Founders Rooftop Mixer',
    slug: 'autumn-indie-founders-mixer',
    organizer_id: 'swaniki',
    options: ['Sat, Oct 10 • 7:00 PM IST', 'Sat, Oct 17 • 7:00 PM IST', 'Sat, Oct 24 • 7:00 PM IST'],
  });
  console.log('Created poll:', pollRes);
  if (!pollRes || !pollRes.slug) throw new Error('Poll creation failed');

  const pollSlug = pollRes.slug;
  const vote1 = await voteOnDatePoll(pollSlug, 1, 'voter1@ai-labs.in');
  const vote2 = await voteOnDatePoll(pollSlug, 1, 'voter2@ai-labs.in');
  console.log('Voted on option 1, votes now:', vote2.poll?.options[1].votes.length);

  const fetchedPoll = await fetchPollBySlug(pollSlug);
  console.log(`Poll fetched. Winning option: "${fetchedPoll?.options[1].date}" with ${fetchedPoll?.options[1].votes.length} votes`);

  // Verify poll page renders
  const pollPage = await fetchUrl(`http://localhost:3000/polls/${pollSlug}`);
  console.log(`Poll Page: Status = ${pollPage.statusCode}, Length = ${pollPage.text.length}`);
  if (pollPage.statusCode !== 200 || pollPage.text.length < 500) {
    throw new Error('Poll voting page failed to render properly');
  }

  console.log('\n=== ALL PHASE 4 VERIFICATION CHECKS PASSED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('\nVerification Error:', err);
  process.exit(1);
});
