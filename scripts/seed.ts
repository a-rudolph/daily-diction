/**
 * Idempotent seed script. Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
 * Run with: pnpm db:seed
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/db/schema';
import { passages } from '../lib/seed/passages';
import { whQuestions } from '../lib/seed/wh-questions';
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
  const allExercises = [...passages, ...whQuestions];
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
      })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${allExercises.length} exercises seeded`);
  console.log(`    - ${passages.length} passage sentences`);
  console.log(`    - ${whQuestions.length} WH questions`);

  console.log('\n✅ Seed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
