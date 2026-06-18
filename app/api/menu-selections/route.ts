import { db } from '@/lib/db';
import { menuSelections } from '@/lib/db/schema';
import { getTodayLocalDate } from '@/lib/date';
import { getCurrentUserId } from '@/lib/auth/server';

interface SelectionsBody {
  menuItemIds: string[];
}

/** POST /api/menu-selections — logs which items the user flagged as hard. */
export async function POST(request: Request) {
  const body: SelectionsBody = await request.json();

  if (!Array.isArray(body.menuItemIds) || body.menuItemIds.length === 0) {
    return Response.json({ ok: true });
  }

  const userId = await getCurrentUserId();
  const localDate = getTodayLocalDate();

  await db.insert(menuSelections).values(
    body.menuItemIds.map((menuItemId) => ({ userId, menuItemId, localDate })),
  );

  return Response.json({ ok: true });
}
