/**
 * File-backed credential store — primary auth storage.
 *
 * Works identically to otp-store.ts: persists to a local JSON file
 * AND keeps an in-memory cache so it survives hot-reloads.
 *
 * This means auth works on localhost WITHOUT any Supabase table setup.
 * In production, also syncing to Supabase `user_credentials` (if it exists)
 * is done from the API routes as a best-effort secondary store.
 */

import fs from 'fs';
import path from 'path';

export interface CredentialEntry {
  pwd_hash: string;
  name: string;
  handle: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const CRED_FILE = path.join(process.cwd(), '.local-credentials.json');

// Global in-memory cache (survives hot-reload on Next.js dev server)
declare global {
  // eslint-disable-next-line no-var
  var __vibe_credentials: Record<string, CredentialEntry> | undefined;
}

function getMemoryStore(): Record<string, CredentialEntry> {
  if (!globalThis.__vibe_credentials) {
    globalThis.__vibe_credentials = {};
  }
  return globalThis.__vibe_credentials;
}

function readStore(): Record<string, CredentialEntry> {
  const mem = getMemoryStore();

  try {
    if (fs.existsSync(CRED_FILE)) {
      const raw = fs.readFileSync(CRED_FILE, 'utf8');
      const disk: Record<string, CredentialEntry> = JSON.parse(raw) || {};
      // Merge disk → memory (disk wins for entries not yet in memory)
      for (const [email, cred] of Object.entries(disk)) {
        if (!mem[email]) {
          mem[email] = cred;
        }
      }
    }
  } catch (e) {
    console.error('[Credentials Store Read Error]:', e);
  }

  return mem;
}

function writeStore(store: Record<string, CredentialEntry>) {
  globalThis.__vibe_credentials = store;
  try {
    fs.writeFileSync(CRED_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[Credentials Store Write Error]:', e);
  }
}

/** Save (or update) a hashed credential for an email. */
export function saveCredential(
  email: string,
  data: Omit<CredentialEntry, 'created_at' | 'updated_at'>
): void {
  const normalized = email.trim().toLowerCase();
  const store = readStore();
  const existing = store[normalized];

  store[normalized] = {
    ...data,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  writeStore(store);
  console.log(`[Credentials Store] Credential saved for: ${normalized}`);
}

/** Retrieve credential entry for an email, or null if not found. */
export function getCredential(email: string): CredentialEntry | null {
  const normalized = email.trim().toLowerCase();
  const store = readStore();
  return store[normalized] || null;
}

/** Check whether an email has a credential entry (fast, no hash comparison). */
export function hasCredential(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const store = readStore();
  return !!store[normalized];
}
