import 'server-only';
import { headers } from 'next/headers';

/**
 * Reads the current user ID from the `x-user-id` header injected by proxy.ts.
 * Throws if the header is missing (should never happen for protected routes).
 */
export async function getCurrentUserId(): Promise<string> {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  if (!userId) throw new Error('Unauthorized: x-user-id header not set');
  return userId;
}
