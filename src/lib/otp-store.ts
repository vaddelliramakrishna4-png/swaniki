import fs from 'fs';
import path from 'path';

export interface OTPEntry {
  code: string;
  expiresAt: number;
  role?: string;
}

const OTP_FILE = path.join(process.cwd(), '.otp-store.json');

function readStore(): Record<string, OTPEntry> {
  try {
    if (fs.existsSync(OTP_FILE)) {
      const data = fs.readFileSync(OTP_FILE, 'utf8');
      return JSON.parse(data) || {};
    }
  } catch (e) {
    console.error('Failed to read OTP store file:', e);
  }
  return {};
}

function writeStore(store: Record<string, OTPEntry>) {
  try {
    fs.writeFileSync(OTP_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write OTP store file:', e);
  }
}

export function saveOtp(email: string, code: string, role: string = 'organizer', ttlMs: number = 15 * 60 * 1000) {
  const normalized = email.trim().toLowerCase();
  const store = readStore();
  store[normalized] = {
    code: code.trim(),
    expiresAt: Date.now() + ttlMs,
    role,
  };
  writeStore(store);
}

export function verifyOtp(email: string, inputCode: string): { valid: boolean; error?: string; role?: string } {
  const normalized = email.trim().toLowerCase();
  const cleanCode = inputCode.trim();
  const store = readStore();
  const entry = store[normalized];

  if (!entry) {
    return { valid: false, error: 'No verification code found for this email. Please request a new code.' };
  }

  if (Date.now() > entry.expiresAt) {
    delete store[normalized];
    writeStore(store);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (entry.code !== cleanCode) {
    return { valid: false, error: 'Invalid verification code. Please check your 6-digit code.' };
  }

  // Code is valid! Consume it
  const role = entry.role || 'organizer';
  delete store[normalized];
  writeStore(store);

  return { valid: true, role };
}
