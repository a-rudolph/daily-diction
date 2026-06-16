import { db } from '@/lib/db';
import { authTokens } from '@/lib/db/schema';
import { createHash } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function VerifyPage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await props.searchParams;
  const rawToken = params.token;

  if (!rawToken) redirect('/login?error=missing');

  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const [record] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, tokenHash),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    );

  if (!record) redirect('/login?error=invalid');

  // Mark token as used (one-time link)
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(eq(authTokens.id, record.id));

  // Set session cookie
  const sessionToken = createSessionToken(record.userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  redirect('/');
}
