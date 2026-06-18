/**
 * Idempotent seed script. Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
 * Run with: pnpm db:seed
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/db/schema';
import { passages } from '../lib/seed/passages';
import { whQuestions } from '../lib/seed/wh-questions';
import { tongueTwisters } from '../lib/seed/tongue-twisters';
import { seedMenus } from '../lib/seed/menus';
import { SEED_USER_ID, SEED_USER_EMAIL } from '../lib/constants';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log('🌱 Seeding database...');

  // Seed user (Phase 1 hardcoded user)
  await db
    .insert(schema.users)
    .values({ id: SEED_USER_ID, email: SEED_USER_EMAIL })
    .onConflictDoNothing();
  console.log(`  ✓ User: ${SEED_USER_EMAIL} (${SEED_USER_ID})`);

  // Seed exercises
  const allExercises = [...passages, ...whQuestions, ...tongueTwisters];
  for (const ex of allExercises) {
    await db
      .insert(schema.exercises)
      .values({
        slug: ex.slug,
        type: ex.type,
        title: ex.title,
        body: ex.body,
        sortOrder: ex.sortOrder,
        isActive: true,
        difficulty: ex.difficulty ?? null,
      })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${allExercises.length} exercises seeded`);
  console.log(`    - ${passages.length} passage sentences`);
  console.log(`    - ${whQuestions.length} WH questions`);
  console.log(`    - ${tongueTwisters.length} tongue twisters`);

  // Seed menus and menu items
  let totalItems = 0;
  for (const menu of seedMenus) {
    const [inserted] = await db
      .insert(schema.menus)
      .values({
        slug: menu.slug,
        name: menu.name,
        cuisine: menu.cuisine,
        sortOrder: menu.sortOrder,
        isActive: true,
      })
      .onConflictDoNothing()
      .returning({ id: schema.menus.id });

    // If the menu already existed, look it up by slug
    let menuId: string;
    if (inserted) {
      menuId = inserted.id;
    } else {
      const [existing] = await db
        .select({ id: schema.menus.id })
        .from(schema.menus)
        .where(eq(schema.menus.slug, menu.slug));
      menuId = existing.id;
    }

    for (const item of menu.items) {
      // Unique key: menu_id + category + name
      await db
        .insert(schema.menuItems)
        .values({
          menuId,
          category: item.category,
          name: item.name,
          description: item.description ?? null,
          price: item.price ?? null,
          sortOrder: item.sortOrder,
        })
        .onConflictDoNothing();
    }

    totalItems += menu.items.length;
  }
  console.log(`  ✓ ${seedMenus.length} menus seeded (${totalItems} items total)`);

  console.log('\n✅ Seed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
