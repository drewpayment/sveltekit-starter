import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { passkeyCredentials, securityKeyCredentials, totpCredentials, users, type AuthUser, type User } from '../../db/schema';
import { decryptToString, encryptString } from "./encryption";
import { hashPassword } from "./password";
import { generateRandomRecoveryCode } from "./utils";

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

export async function createUser(email: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const rawRecoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(rawRecoveryCode);
  
  const newUser = {
    email,
    password: passwordHash,
    role: 'user',
    recoveryCode: encryptedRecoveryCode,
  } as unknown as User;
  
  try {
    const user = await db.insert(users)
      .values(newUser)
      .returning();
      
    return user[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
  
  try {
    await db.update(users)
      .set({
        password: passwordHash,
      })
      .where(eq(users.id, userId));
  } catch (err) {
    console.error('Error updating user password:', err);
    throw err;
  }
}

export async function updateUserEmailAndSetEmailAsVerified(userId: number, email: string) {
	try {
    await db.update(users)
      .set({
        email,
        emailVerified: true,
      })
      .where(eq(users.id, userId));
  } catch (err) {
    console.error('Error updating user email:', err);
    throw err;
  }
}

export async function setUserAsEmailVerifiedIfEmailMatches(userId: number, email: string): Promise<boolean> {
	try {
    const updatedIds = await db.update(users)
      .set({
        emailVerified: true,
      })
      .where(and(eq(users.id, userId), eq(users.email, email)))
      .returning({ id: users.id, });
      
    return updatedIds[0].id == userId;
  } catch (err) {
    console.error('Error setting user as email verified:', err);
    throw err;
  }
}

export async function getUserPasswordHash(userId: number): Promise<string> {
  try {
    const userPwHash = await db
      .select({
        password: users.password,
      })
      .from(users)
      .where(eq(users.id, userId));
      
    return userPwHash && userPwHash[0] ? userPwHash[0].password! : '';
  } catch (err) {
    console.error('Error getting user password hash:', err);
    throw err;
  }
}

export async function getUserRecoveryCode(userId: number): Promise<string> {
  try {
    const recoveryCode = await db.select({
        recoveryCode: users.recoveryCode,
      })
      .from(users)
      .where(eq(users.id, userId));
      
    return recoveryCode && recoveryCode[0] ? decryptToString(recoveryCode[0].recoveryCode! as unknown as Uint8Array) : '';
  } catch (err) {
    console.error('Error getting user recovery code:', err);
    throw err;
  }
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
	
  try {
    const recoveryCode = generateRandomRecoveryCode();
    const encryptedRecoveryCode = encryptString(recoveryCode);
    
    await db.update(users)
      .set({
        recoveryCode: encryptedRecoveryCode,
      })
      .where(eq(users.id, userId));
      
    return recoveryCode;
  } catch (err) {
    console.error('Error resetting user recovery code:', err);
    throw err;
  }
}

export async function getUserFromEmail(email: string): Promise<AuthUser | null> {
  try {
    const res = await db.select()
      .from(users)
      .leftJoin(totpCredentials, eq(users.id, totpCredentials.userId))
      .leftJoin(passkeyCredentials, eq(users.id, passkeyCredentials.userId))
      .leftJoin(securityKeyCredentials, eq(users.id, securityKeyCredentials.userId))
      .where(eq(users.email, email));
      
    const result = res[0] || null;
    
    if (!result) return null;
    
    return {
      id: result.users.id,
      email: result.users.email,
      emailVerified: result.users.emailVerified,
      registeredTOTP: result.totp_credentials !== null,
      registeredPasskey: result.passkey_credentials !== null,
      registeredSecurityKey: result.security_key_credentials !== null,
      registered2FA: result.totp_credentials !== null || 
        result.passkey_credentials !== null || 
        result.security_key_credentials !== null,
    } as AuthUser;
  } catch (err) {
    console.error('Error getting user from email:', err);
    throw err;
  }
}
