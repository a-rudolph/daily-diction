import { db } from '@/lib/db';
import { authTokens, users } from '@/lib/db/schema';
import { randomBytes, createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();
  const normalised = (email ?? '').toLowerCase().trim();

  if (!normalised || !normalised.includes('@')) {
    return Response.json({ ok: true }); // don't leak validation errors
  }

  // Upsert user so any email can sign in
  const [user] = await db
    .insert(users)
    .values({ email: normalised })
    .onConflictDoUpdate({
      target: users.email,
      set: { email: sql`${users.email}` }, // no-op — ensures RETURNING fires on conflict
    })
    .returning({ id: users.id });

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await db.insert(authTokens).values({ userId: user.id, tokenHash, expiresAt });

  const origin = new URL(request.url).origin;
  const verifyUrl = `${origin}/api/auth/verify?token=${rawToken}`;

  await resend.emails.send({
    from: 'Daily Diction <onboarding@resend.dev>',
    to: normalised,
    subject: 'Your Daily Diction login link',
    html: `
      <p style="font-family:sans-serif;font-size:16px">
        Click the link below to log in to Daily Diction.
        This link expires in <strong>15 minutes</strong> and can only be used once.
      </p>
      <p style="margin:24px 0">
        <a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:16px;font-weight:600">
          Log in →
        </a>
      </p>
      <p style="font-family:sans-serif;font-size:13px;color:#888">
        If you didn't request this, you can safely ignore it.
      </p>
    `,
  });

  return Response.json({ ok: true });
}
