import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local so drizzle-kit commands pick up DATABASE_URL without
// needing the variable exported in the shell.
config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
