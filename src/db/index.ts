import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_URL } from '$env/static/private';

export const db = drizzle(DATABASE_URL);
