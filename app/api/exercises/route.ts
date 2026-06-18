import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/exercises?type=passage|wh_question
 * Returns active exercises filtered by type.
 * This route exists (in addition to RSC direct DB reads) so the service
 * worker can cache it for offline prompt display.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'passage' | 'wh_question' | 'tongue_twister' | null;

  const where =
    type === 'passage' || type === 'wh_question' || type === 'tongue_twister'
      ? and(eq(exercises.type, type), eq(exercises.isActive, true))
      : eq(exercises.isActive, true);

  const rows = await db
    .select({
      id: exercises.id,
      slug: exercises.slug,
      type: exercises.type,
      title: exercises.title,
      body: exercises.body,
      sortOrder: exercises.sortOrder,
    })
    .from(exercises)
    .where(where)
    .orderBy(exercises.sortOrder);

  return Response.json(rows);
}
