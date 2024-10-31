import { generateRandomRecoveryCode } from "./utils";
import { ExpiringTokenBucket } from "./rate-limit";
import { decryptToString, encryptString } from "./encryption";
import { db } from '../../db';
import { passkeyCredentials, securityKeyCredentials, sessions, totpCredentials, users, type User } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { AuthUser } from '$lib/types/auth-user.model';

export const recoveryCodeBucket = new ExpiringTokenBucket<number>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(userId: number, recoveryCode: string): Promise<boolean> {
  const result = await db.transaction(async (tx) => {
    try {
      const rows = await tx.select({
        recoveryCode: users.recoveryCode,
      }).from(users).where(eq(users.id, userId));
      
      const recovCode = rows[0].recoveryCode;
      const currRecovCode = decryptToString(recovCode as unknown as Uint8Array);
      if (recoveryCode !== currRecovCode) {
        return false;
      }
      
      const newRecoveryCode = generateRandomRecoveryCode();
      const encryptedNewRecoveryCode = encryptString(newRecoveryCode);
      const update = {
        recoveryCode: encryptedNewRecoveryCode,
      } as User;
      
      await tx.update(users).set(update).where(eq(users.id, userId));
      await tx.update(sessions).set({ mfaVerified: false }).where(eq(sessions.userId, userId));
      await tx.delete(totpCredentials).where(eq(totpCredentials.userId, userId));
      await tx.delete(passkeyCredentials).where(eq(passkeyCredentials.userId, userId));
      await tx.delete(securityKeyCredentials).where(eq(securityKeyCredentials.userId, userId));
            
      return true;
    } catch (err) {
      console.error(err);
      tx.rollback();
      return false;
    }
  });
  
  return result;
}

export function get2FARedirect(user: AuthUser): string {
	if (user.registeredPasskey) {
		return "/2fa/passkey";
	}
	if (user.registeredSecurityKey) {
		return "/2fa/security-key";
	}
	if (user.registeredTOTP) {
		return "/2fa/totp";
	}
	return "/2fa/setup";
}

export function getPasswordReset2FARedirect(user: AuthUser): string {
	if (user.registeredPasskey) {
		return "/reset-password/2fa/passkey";
	}
	if (user.registeredSecurityKey) {
		return "/reset-password/2fa/security-key";
	}
	if (user.registeredTOTP) {
		return "/reset-password/2fa/totp";
	}
	return "/2fa/setup";
}