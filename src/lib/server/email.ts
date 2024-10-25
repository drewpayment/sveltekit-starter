import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';


export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const userResults = await db.select().from(users)
    .where(eq(users.email, email));
    
  return userResults.length === 0;
}