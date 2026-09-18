import http from 'http';

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let text = '';
        res.on('data', (c) => (text += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(text) });
          } catch {
            resolve({ status: res.statusCode, raw: text });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let text = '';
      res.on('data', (c) => (text += c));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, length: text.length });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== VERIFYING EVENT 404 RESOLUTION ===\n');

  const testEventId = 'evt-live-gathering-' + Date.now();
  const testSlug = 'delhi-poetry-salon-' + Date.now().toString(36);

  const testEvent = {
    id: testEventId,
    slug: testSlug,
    title: 'Delhi Modern Heritage Poetry Salon',
    tagline: 'An evening of spoken verse and classical Hindustani ragas',
    description: 'A curated gathering for writers, musicians, and thinkers in Old Delhi.',
    category: 'Cultural',
    theme_template: 'Grove',
    start_time: '2026-09-25T19:00:00+05:30',
    end_time: '2026-09-25T22:30:00+05:30',
    location: 'Chandni Chowk, Old Delhi',
    venue_name: 'Haveli Dharampura',
    is_virtual: false,
    capacity: 35,
    approval_required: false,
    status: 'published',
    custom_questions: [],
    sections: {
      agenda: [{ time: '7:00 PM', title: 'Welcome Drinks' }],
      faq: [{ question: 'What is the dress code?', answer: 'Traditional or smart casual.' }]
    }
  };

  // 1. Sync event via /api/events/sync
  console.log('[1] Syncing test event to server...');
  const syncRes = await postJson('http://localhost:3000/api/events/sync', testEvent);
  console.log('Sync response status:', syncRes.status, 'success:', syncRes.json?.success);

  // 2. Fetch via /events/[id]
  console.log('\n[2] Requesting GET /events/' + testEventId + ' ...');
  const eventRes = await getUrl('http://localhost:3000/events/' + testEventId);
  console.log('GET /events/' + testEventId + ' -> Status:', eventRes.status, '(HTML byte length:', eventRes.length, ')');

  if (eventRes.status === 200) {
    console.log('>>> SUCCESS: /events/[id] returned HTTP 200 (NOT 404!)');
  } else {
    throw new Error('FAILED: Expected 200 but got ' + eventRes.status);
  }

  // 3. Fetch via /events/[slug]
  console.log('\n[3] Requesting GET /events/' + testSlug + ' ...');
  const slugRes = await getUrl('http://localhost:3000/events/' + testSlug);
  console.log('GET /events/' + testSlug + ' -> Status:', slugRes.status, '(HTML byte length:', slugRes.length, ')');

  if (slugRes.status === 200) {
    console.log('>>> SUCCESS: /events/[slug] returned HTTP 200 (NOT 404!)');
  } else {
    throw new Error('FAILED: Expected 200 but got ' + slugRes.status);
  }

  // 4. Fetch via dynamic root /[slug]
  console.log('\n[4] Requesting GET /' + testSlug + ' ...');
  const rootSlugRes = await getUrl('http://localhost:3000/' + testSlug);
  console.log('GET /' + testSlug + ' -> Status:', rootSlugRes.status, '(HTML byte length:', rootSlugRes.length, ')');

  if (rootSlugRes.status === 200) {
    console.log('>>> SUCCESS: /[slug] returned HTTP 200 (NOT 404!)');
  } else {
    throw new Error('FAILED: Expected 200 but got ' + rootSlugRes.status);
  }

  console.log('\n=== ALL TESTS PASSED: NO MORE 404 ERRORS! ===');
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
