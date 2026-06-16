import { db } from '@/lib/db';
import { authTokens } from '@/lib/db/schema';
import { randomBytes, createHash } from 'node:crypto';
import { SEED_USER_ID, SEED_USER_EMAIL } from '@/lib/constants';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();
  const normalised = (email ?? '').toLowerCase().trim();

  // Always return 200 to avoid revealing whether an email is registered.
  if (normalised !== SEED_USER_EMAIL) {
    return Response.json({ ok: true });
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await db.insert(authTokens).values({
    userId: SEED_USER_ID,
    tokenHash,
    expiresAt,
  });

  const origin = new URL(request.url).origin;
  const verifyUrl = `${origin}/auth/verify?token=${rawToken}`;

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
