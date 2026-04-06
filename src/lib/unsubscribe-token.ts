import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Generate an HMAC token for unsubscribe link validation.
 * Token = HMAC-SHA256(email:siteId, UNSUBSCRIBE_SECRET), hex-encoded, first 32 chars.
 * Returns empty string if UNSUBSCRIBE_SECRET is not configured.
 */
export function createUnsubscribeToken(email: string, siteId: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) return '';
  return createHmac('sha256', secret)
    .update(`${email.toLowerCase()}:${siteId}`)
    .digest('hex')
    .slice(0, 32);
}

/**
 * Verify a token using a constant-time comparison to prevent timing attacks.
 * Returns false if UNSUBSCRIBE_SECRET is not configured or the token is wrong.
 */
export function verifyUnsubscribeToken(email: string, siteId: string, token: string): boolean {
  const expected = createUnsubscribeToken(email, siteId);
  if (!expected || !token) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(token, 'hex'));
  } catch {
    return false;
  }
}
