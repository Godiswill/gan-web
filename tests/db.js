import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import pkg from '@next/env';
const { loadEnvConfig } = pkg;

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const client = postgres(process.env.AUTH_DRIZZLE_URL);
const db = drizzle({ client });

const result = await db.execute('select * from user');
console.log(result);
await client.end();
