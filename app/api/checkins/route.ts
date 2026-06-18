import { db } from '@/lib/db';
import { dailyCheckins } from '@/lib/db/schema';
import { getTodayLocalDate } from '@/lib/date';
import { getCurrentUserId } from '@/lib/auth/server';

interface CheckinBody {
  situation: 'call' | 'in_person' | 'ordering' | 'presentation' | 'other';
  rating: 'rough' | 'okay' | 'good';
  note?: string | null;
}

/**
 * POST /api/checkins
 * Logs a real-world speaking check-in. Does NOT feed the 5/5 streak.
 */
export async function POST(request: Request) {
  const body: CheckinBody = await request.json();

  const userId = await getCurrentUserId();
  const localDate = getTodayLocalDate();

  await db.insert(dailyCheckins).values({
    userId,
    localDate,
    situation: body.situation,
    rating: body.rating,
    note: body.note ?? null,
  });

  return Response.json({ ok: true });
}
