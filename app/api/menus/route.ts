import { db } from '@/lib/db';
import { menus } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

/** GET /api/menus — returns all active menus for the cuisine picker. */
export async function GET() {
  const rows = await db
    .select({
      id: menus.id,
      slug: menus.slug,
      name: menus.name,
      cuisine: menus.cuisine,
    })
    .from(menus)
    .where(eq(menus.isActive, true))
    .orderBy(asc(menus.sortOrder));

  return Response.json(rows);
}
