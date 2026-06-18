import { db } from '@/lib/db';
import { menus, menuItems } from '@/lib/db/schema';
import { and, eq, asc } from 'drizzle-orm';

export interface MenuItemRow {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: string | null;
  sortOrder: number;
}

export interface MenuWithItems {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  categories: { name: string; items: MenuItemRow[] }[];
}

/** GET /api/menus/[id] — returns a menu with items grouped by category. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [menu] = await db
    .select({ id: menus.id, slug: menus.slug, name: menus.name, cuisine: menus.cuisine })
    .from(menus)
    .where(and(eq(menus.id, id), eq(menus.isActive, true)));

  if (!menu) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const items = await db
    .select({
      id: menuItems.id,
      category: menuItems.category,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      sortOrder: menuItems.sortOrder,
    })
    .from(menuItems)
    .where(eq(menuItems.menuId, id))
    .orderBy(asc(menuItems.sortOrder));

  // Group by category, preserving first-seen order
  const categoryMap = new Map<string, MenuItemRow[]>();
  for (const item of items) {
    const existing = categoryMap.get(item.category);
    if (existing) {
      existing.push(item);
    } else {
      categoryMap.set(item.category, [item]);
    }
  }

  const result: MenuWithItems = {
    ...menu,
    categories: Array.from(categoryMap.entries()).map(([name, catItems]) => ({
      name,
      items: catItems,
    })),
  };

  return Response.json(result);
}
