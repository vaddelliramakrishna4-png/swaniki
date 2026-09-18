import crypto from 'crypto';

/**
 * Robust stateless OTP verification engine for Vercel Serverless Functions & Localhost.
 * Uses HMAC-SHA256 signatures so verification works across isolated/ephemeral lambda containers
 * without relying on a shared filesystem or database schema.
 */

const OTP_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.RESEND_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'vibe-by-swaniki-production-otp-salt-2026';

/**
 * Generate a cryptographically signed verification token for an email + 6-digit code.
 * Format: expiresAt.signature
 */
export function generateVerificationToken(
  email: string,
  code: string,
  ttlMs: number = 15 * 60 * 1000
): string {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = code.trim().replace(/\D/g, '');
  const expiresAt = Date.now() + ttlMs;

  const data = `${normalizedEmail}:${cleanCode}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');

  return `${expiresAt}.${signature}`;
}

/**
 * Verify an input code against one or more signed verification tokens.
 * Supports a single token or an array of recent tokens (for multiple resends).
 */
export function verifyStatelessTokens(
  email: string,
  inputCode: string,
  tokens: string | string[] | undefined
): { valid: boolean; error?: string } {
  if (!tokens) {
    return { valid: false, error: 'No verification token provided.' };
  }

  const tokenList = Array.isArray(tokens)
    ? tokens
    : typeof tokens === 'string'
    ? tokens.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  if (tokenList.length === 0) {
    return { valid: false, error: 'No valid verification token provided.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = inputCode.trim().replace(/\D/g, '');
  const now = Date.now();

  let hasUnexpired = false;

  for (const token of tokenList) {
    const parts = token.split('.');
    if (parts.length !== 2) continue;

    const [expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);

    if (isNaN(expiresAt) || !signature) continue;

    // Check expiration
    if (expiresAt < now) continue;

    hasUnexpired = true;

    // Reconstruct expected HMAC signature
    const data = `${normalizedEmail}:${cleanCode}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');

    // Constant-time comparison
    if (signature.length === expectedSignature.length) {
      try {
        const sigBuf = Buffer.from(signature, 'hex');
        const expBuf = Buffer.from(expectedSignature, 'hex');
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          return { valid: true };
        }
      } catch {}
    }
  }

  if (!hasUnexpired) {
    return {
      valid: false,
      error: 'Verification code has expired. Please click "Resend code" to receive a fresh code.',
    };
  }

  return {
    valid: false,
    error: 'Invalid 6-digit verification code. Please check the code in your email or click "Resend code".',
  };
}
