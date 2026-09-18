import http from 'http';
import fs from 'fs';
import path from 'path';

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
          text: buffer.toString('utf-8'),
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== STARTING LAUNCH READINESS VERIFICATION (PHASE 6) ===');

  // 1. Verify Marketing Landing Page
  console.log('\n[1] Testing Marketing Landing Page http://localhost:3000/ ...');
  const home = await fetchUrl('http://localhost:3000/');
  console.log(`Home Page: Status = ${home.statusCode}, Length = ${home.text.length}`);

  if (home.statusCode !== 200) {
    throw new Error(`Marketing landing page failed with status ${home.statusCode}`);
  }

  // Verify Hero & 72px Headline
  if (!home.text.includes('Craft Extraordinary Salons') && !home.text.includes('Bengaluru, Mumbai')) {
    throw new Error('Hero headline missing from landing page');
  }

  // Verify Template Cycler
  if (!home.text.includes('Template:') || !home.text.includes('Sprint') || !home.text.includes('Grove')) {
    throw new Error('Template cycler elements missing from landing page');
  }

  // Verify Live Stat Bar
  if (!home.text.includes('Curated Salons') || !home.text.includes('Confirmed RSVPs')) {
    throw new Error('Live stat bar missing from landing page');
  }

  // Verify 3-Column Feature Section
  if (
    !home.text.includes('5 Signature Aesthetics') ||
    !home.text.includes('Gemini 1.5 Flash AI Copy') ||
    !home.text.includes('1-Click Social Banners')
  ) {
    throw new Error('3-column feature section missing from landing page');
  }

  // Verify Honest Pricing Card
  if (!home.text.includes('Free forever, for now')) {
    throw new Error('Honest pricing card missing from landing page');
  }

  // Verify Embedded Discovery Feed
  if (!home.text.includes('Explore Curated Gatherings') || !home.text.includes('Search by title')) {
    throw new Error('Embedded Discovery Feed missing from landing page');
  }

  console.log('✓ Marketing landing page verified with all required hero, cycler, features, stats, and pricing elements.');

  // 2. Verify Vercel Analytics Integration
  console.log('\n[2] Testing Vercel Analytics Integration ...');
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  if (!layoutContent.includes('@vercel/analytics/react') || !layoutContent.includes('<Analytics />')) {
    throw new Error('Vercel Analytics not mounted in src/app/layout.tsx');
  }
  console.log('✓ Vercel Analytics plugin confirmed mounted in RootLayout.');

  // 3. Verify Out-of-Scope Compliance Audit
  console.log('\n[3] Auditing Out-of-Scope Constraints (Rules File Compliance) ...');
  const outOfScopeItems = [
    { name: 'Razorpay / Payment Billing', forbidden: ['razorpay', 'stripe_checkout', 'create-payment-intent'] },
    { name: 'QR Code Check-in Scanner', forbidden: ['qr_scanner', 'html5-qrcode', 'checkin_code'] },
    { name: 'Super Admin Dashboard', forbidden: ['/super-admin', '/superadmin', 'is_super_admin'] },
    { name: 'Custom Domain / CNAME Router', forbidden: ['cname_records', 'add_custom_domain'] },
    { name: 'SMS / Twilio Notifications', forbidden: ['twilio', 'send_sms'] },
    { name: 'Native Mobile App Shell', forbidden: ['react-native', 'capacitor', '@capacitor/core'] },
    { name: 'Public API / Webhook Dispatcher', forbidden: ['/api/v1/webhooks', 'dispatch_webhook'] },
    { name: 'Drag-and-Drop Page Editor', forbidden: ['react-dnd', 'craftjs', 'grapesjs'] },
  ];

  const srcDir = path.join(process.cwd(), 'src');
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    let allText = '';
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        allText += scanDir(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        allText += ' ' + fs.readFileSync(fullPath, 'utf-8').toLowerCase();
      }
    }
    return allText;
  }

  const combinedCode = scanDir(srcDir);

  for (const item of outOfScopeItems) {
    for (const term of item.forbidden) {
      if (combinedCode.includes(term.toLowerCase())) {
        throw new Error(`Out-of-scope feature detected: "${term}" in ${item.name}`);
      }
    }
    console.log(`  ✓ ${item.name}: NOT BUILT (100% compliant)`);
  }

  // 4. Verify Production Readiness Artifacts
  console.log('\n[4] Testing Production Deploy Readiness (.env.example & README.md) ...');
  const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf-8');
  if (!envExample.includes('NEXT_PUBLIC_SUPABASE_URL') || !envExample.includes('GEMINI_API_KEY') || !envExample.includes('RESEND_API_KEY')) {
    throw new Error('.env.example missing essential configuration variables');
  }

  const readme = fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf-8');
  if (!readme.includes('Vibe by Swaniki') || !readme.includes('Getting Started') || !readme.includes('Deploying to Vercel')) {
    throw new Error('README.md missing setup or deployment sections');
  }
  console.log('✓ .env.example and README.md verified.');

  console.log('\n=== ALL PHASE 6 LAUNCH VERIFICATION CHECKS PASSED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('\nVerification Error:', err);
  process.exit(1);
});
