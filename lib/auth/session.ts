import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'dd_session';
const SESSION_DAYS = 30;

function secret() {
  return process.env.SESSION_SECRET ?? 'dev-insecure-secret-set-SESSION_SECRET-in-env';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

/**
 * Creates a stateless, HMAC-signed session token.
 * Format: `{userId}:{expiryMs}:{hmac}`
 * The proxy verifies this without a DB lookup on every request.
 */
export function createSessionToken(userId: string): string {
  const expiry = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = `${userId}:${expiry}`;
  return `${payload}:${sign(payload)}`;
}

/** Returns `{ userId }` if the token is valid and not expired, else `null`. */
export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const lastColon = token.lastIndexOf(':');
    if (lastColon < 1) return null;

    const payload = token.slice(0, lastColon);
    const sig = token.slice(lastColon + 1);

    const expected = sign(payload);
    // Constant-time comparison to prevent timing attacks
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;

    // payload = "{userId}:{expiryMs}" — userId is a UUID (hyphens, no colons)
    const colonIdx = payload.indexOf(':');
    const userId = payload.slice(0, colonIdx);
    const expiry = Number(payload.slice(colonIdx + 1));

    if (!userId || isNaN(expiry) || Date.now() > expiry) return null;
    return { userId };
  } catch {
    return null;
  }
}
