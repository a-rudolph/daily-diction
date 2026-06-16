import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const stateCookie = request.cookies.get('oauth_state')?.value;

  // CSRF check
  if (!code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  // Exchange code → access token
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/api/auth/callback/google`,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  const { access_token } = await tokenRes.json();

  // Fetch email from Google
  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  const { email } = (await userRes.json()) as { email?: string };

  if (!email) {
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  // Upsert user so any Google account can sign in
  const [user] = await db
    .insert(users)
    .values({ email: email.toLowerCase() })
    .onConflictDoUpdate({
      target: users.email,
      set: { email: sql`${users.email}` }, // no-op — ensures RETURNING fires on conflict
    })
    .returning({ id: users.id });

  const sessionToken = createSessionToken(user.id);
  const response = NextResponse.redirect(`${origin}/`);

  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  response.cookies.delete('oauth_state');

  return response;
}
