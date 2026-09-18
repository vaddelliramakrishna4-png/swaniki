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

async function run() {
  console.log('Testing RSVP with synthetic user_id: usr_1789749127252');

  const res = await postJson('http://localhost:3000/api/events/rsvp', {
    event_id: 'bengaluru-ai-founders-salon',
    guest_name: 'Rohit Sharma',
    guest_email: 'rohit.builder@gmail.com',
    user_id: 'usr_1789749127252',
    phone: '+91 98765 43210',
    answers: {
      dietary: 'Vegetarian',
      plus_one: false,
    },
  });

  console.log('RSVP Response:', res);
  if (res.json?.success) {
    console.log('>>> SUCCESS: RSVP submitted without any UUID syntax error!');
  } else {
    throw new Error('RSVP submission failed: ' + JSON.stringify(res.json));
  }
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
