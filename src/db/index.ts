import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool);