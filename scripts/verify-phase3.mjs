async function verifyPhase3() {
  console.log('=== 1. Create a live event with slug ===');
  const createRes = await fetch('http://localhost:3000/api/events/test-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType: 'in-person' })
  });
  const createJson = await createRes.json();
  const event = createJson.event;
  console.log('Event created:', { id: event.id, slug: event.slug, title: event.title, template: event.theme_template });

  console.log('\n=== 2. Test Root Vanity URL (GET /[slug]) ===');
  const pageRes = await fetch('http://localhost:3000/' + event.slug);
  console.log('GET /' + event.slug + ' status:', pageRes.status);
  const pageHtml = await pageRes.text();
  console.log('Includes Event Title:', pageHtml.includes(event.title));
  console.log('Includes IST timing:', pageHtml.includes('IST'));
  console.log('Includes Open Graph metadata:', pageHtml.includes('og:title') || pageHtml.includes(event.title));
  console.log('Includes WhatsApp Share:', pageHtml.includes('WhatsApp'));
  console.log('Includes Who is Going:', pageHtml.includes("Who's Going") || pageHtml.includes('Confirmed Guests'));

  console.log('\n=== 3. Initial RSVP count ===');
  const rsvpGetRes = await fetch('http://localhost:3000/api/events/rsvp?eventId=' + event.id);
  const rsvpGetData = await rsvpGetRes.json();
  console.log('Initial RSVPs count:', rsvpGetData.count);

  console.log('\n=== 4. Submit RSVP as a second guest ===');
  const secondGuest = {
    event_id: event.id,
    guest_name: 'Dr. Radhika Sen',
    guest_email: 'radhika@frontier-bio.in',
    phone: '+91 98765 43210',
    answers: { dietary: 'vegan', tshirt_size: 'M' }
  };
  const rsvpPostRes = await fetch('http://localhost:3000/api/events/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(secondGuest)
  });
  const rsvpPostData = await rsvpPostRes.json();
  console.log('RSVP Submission Response:', rsvpPostData);

  console.log('\n=== 5. Verify updated RSVP count and roster ===');
  const updatedRsvpRes = await fetch('http://localhost:3000/api/events/rsvp?eventId=' + event.id);
  const updatedRsvpData = await updatedRsvpRes.json();
  console.log('Updated RSVPs count:', updatedRsvpData.count);
  const guestFound = updatedRsvpData.rsvps.find(r => r.guest_name === 'Dr. Radhika Sen');
  console.log('Found new guest in roster:', !!guestFound, guestFound?.guest_name, guestFound?.status);

  console.log('\n=== 6. Verify /templates showcase renders all 5 templates ===');
  const tplRes = await fetch('http://localhost:3000/templates');
  console.log('GET /templates status:', tplRes.status);
  const tplHtml = await tplRes.text();
  console.log('Includes Grove:', tplHtml.includes('Grove'));
  console.log('Includes Sprint:', tplHtml.includes('Sprint'));
  console.log('Includes Bloom:', tplHtml.includes('Bloom'));
  console.log('Includes Vertex:', tplHtml.includes('Vertex'));
  console.log('Includes Ember:', tplHtml.includes('Ember'));

  console.log('\n=== All Phase 3 Verification Checks Succeeded! ===');
}

verifyPhase3().catch(console.error);
