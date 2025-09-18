import { defineConfig } from 'drizzle-kit';
import '@/lib/utils/env';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/supabase',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.AUTH_DRIZZLE_URL!,
  },
});
