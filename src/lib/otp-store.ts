import fs from 'fs';
import path from 'path';

export interface OTPCodeItem {
  code: string;
  expiresAt: number;
}

export interface OTPEntry {
  codes: OTPCodeItem[];
  role: string;
  lastVerifiedAt?: number;
  lastVerifiedCode?: string;
}

const OTP_FILE = path.join(process.cwd(), '.otp-store.json');

// Global memory cache to prevent worker desync and race conditions
declare global {
  // eslint-disable-next-line no-var
  var __vibe_otp_store: Record<string, OTPEntry> | undefined;
}

function getMemoryStore(): Record<string, OTPEntry> {
  if (!globalThis.__vibe_otp_store) {
    globalThis.__vibe_otp_store = {};
  }
  return globalThis.__vibe_otp_store;
}

function readStore(): Record<string, OTPEntry> {
  const memStore = getMemoryStore();

  try {
    if (fs.existsSync(OTP_FILE)) {
      const data = fs.readFileSync(OTP_FILE, 'utf8');
      const diskStore: Record<string, any> = JSON.parse(data) || {};

      // Migrate legacy single-code format to array format seamlessly
      for (const [email, val] of Object.entries(diskStore)) {
        const cleanEmail = email.trim().toLowerCase();
        if (val && typeof val === 'object') {
          if (Array.isArray(val.codes)) {
            memStore[cleanEmail] = val as OTPEntry;
          } else if (val.code && val.expiresAt) {
            memStore[cleanEmail] = {
              codes: [{ code: String(val.code).trim(), expiresAt: Number(val.expiresAt) }],
              role: val.role || 'organizer',
              lastVerifiedAt: val.lastVerifiedAt,
              lastVerifiedCode: val.lastVerifiedCode,
            };
          }
        }
      }
    }
  } catch (e) {
    console.error('[OTP Store Read Error]:', e);
  }

  return memStore;
}

function writeStore(store: Record<string, OTPEntry>) {
  try {
    globalThis.__vibe_otp_store = store;
    fs.writeFileSync(OTP_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[OTP Store Write Error]:', e);
  }
}

/**
 * Save an OTP code for an email. Keeps up to 5 recent active codes
 * so if the user requested twice, both codes in their inbox remain valid.
 */
export function saveOtp(
  email: string,
  code: string,
  role: string = 'organizer',
  ttlMs: number = 15 * 60 * 1000
) {
  const normalized = email.trim().toLowerCase();
  const cleanCode = code.trim().replace(/\D/g, '');
  const now = Date.now();
  const expiresAt = now + ttlMs;

  const store = readStore();
  const existing = store[normalized];

  // Retain unexpired codes
  const activeCodes: OTPCodeItem[] = (existing?.codes || []).filter(
    (c) => c.expiresAt > now
  );

  // Add the new code at the start
  activeCodes.unshift({ code: cleanCode, expiresAt });

  store[normalized] = {
    codes: activeCodes.slice(0, 5), // Keep up to 5 recent active codes
    role,
    lastVerifiedAt: existing?.lastVerifiedAt,
    lastVerifiedCode: existing?.lastVerifiedCode,
  };

  writeStore(store);
  console.log(`[OTP Store] Code saved for ${normalized}: ${cleanCode} (Valid until ${new Date(expiresAt).toLocaleTimeString()})`);
}

/**
 * Verify an OTP code for an email. Checks against all recent active codes.
 * Includes a 5-minute grace period for the exact verified code to prevent double-click / StrictMode errors.
 */
export function verifyOtp(
  email: string,
  inputCode: string
): { valid: boolean; error?: string; role?: string } {
  const normalized = email.trim().toLowerCase();
  const cleanCode = inputCode.trim().replace(/\D/g, '');
  const now = Date.now();

  const store = readStore();
  const entry = store[normalized];

  if (!entry) {
    return {
      valid: false,
      error: 'No active verification code found for this email. Please request a new code.',
    };
  }

  // 1. If this exact code was already verified within 5 minutes grace window, allow it
  if (
    entry.lastVerifiedCode === cleanCode &&
    entry.lastVerifiedAt &&
    now - entry.lastVerifiedAt < 5 * 60 * 1000
  ) {
    return { valid: true, role: entry.role || 'organizer' };
  }

  // 2. Check if there are active codes
  if (!entry.codes || entry.codes.length === 0) {
    return {
      valid: false,
      error: 'No active verification code found for this email. Please click "Resend code".',
    };
  }

  // 3. Filter unexpired codes
  const validCodes = entry.codes.filter((c) => c.expiresAt > now);

  if (validCodes.length === 0) {
    delete store[normalized];
    writeStore(store);
    return {
      valid: false,
      error: 'Verification code has expired. Please click "Resend code" to receive a fresh code.',
    };
  }

  // 4. Check if input code matches any of the active codes
  const matched = validCodes.find((c) => c.code === cleanCode);

  if (!matched) {
    return {
      valid: false,
      error: 'Invalid 6-digit verification code. Please check your email or click "Resend code".',
    };
  }

  // 5. Code is valid! Consume it, record lastVerifiedAt and lastVerifiedCode
  const role = entry.role || 'organizer';
  entry.lastVerifiedAt = now;
  entry.lastVerifiedCode = cleanCode;
  entry.codes = validCodes.filter((c) => c.code !== cleanCode);
  store[normalized] = entry;
  writeStore(store);

  console.log(`[OTP Store] Code ${cleanCode} verified successfully for ${normalized}`);
  return { valid: true, role };
}
