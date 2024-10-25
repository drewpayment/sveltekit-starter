import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { totpCredentials } from '../../db/schema';
import { decrypt, encrypt } from "./encryption";
import { ExpiringTokenBucket, RefillingTokenBucket } from "./rate-limit";

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const totpUpdateBucket = new RefillingTokenBucket<number>(3, 60 * 10);

export async function getUserTOTPKey(userId: number): Promise<Uint8Array | null> {
  try {
    const rows = await db.select({
        value: totpCredentials.secret,
      })
      .from(totpCredentials)
      .where(eq(totpCredentials.userId, userId))
      
    if (!rows || !rows.length) return null;
    
    return rows[0].value ? decrypt(rows[0].value) : null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateUserTOTPKey(userId: number, key: Uint8Array): Promise<void> {
	const encrypted = encrypt(key);
  
  await db.transaction(async (tx) => {
    try {
      await tx.delete(totpCredentials).where(eq(totpCredentials.userId, userId));
      await tx.insert(totpCredentials).values({ userId, secret: encrypted });
    } catch (err) {
      console.error(err);
      tx.rollback();
    }
  });
}

export async function deleteUserTOTPKey(userId: number): Promise<void> {
	await db.delete(totpCredentials).where(eq(totpCredentials.userId, userId));
}