import { encodeHexLowerCase } from "@oslojs/encoding";
import { generateRandomOTP } from "./utils";
import { sha256 } from "@oslojs/crypto/sha2";
import type { RequestEvent } from "@sveltejs/kit";
import { passkeyCredentials, passwordResets, securityKeyCredentials, totpCredentials, users, type User } from '../../db/schema';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import type { AuthUser } from '$lib/types/auth-user.model';

export async function createPasswordResetSession(token: string, userId: number, email: string): Promise<PasswordResetSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false
	};
  
  try {
    await db.insert(passwordResets)
      .values({
        resetId: sessionId,
        userId: session.userId,
        email: session.email,
        code: session.code,
        expiresAt: session.expiresAt,
      });
  } catch (e) {
    console.error(e);
    throw e;
  }
  
	return session;
}

export async function validatePasswordResetSessionToken(token: string): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  
  try {
    const rows = await db.select().from(passwordResets)
      .innerJoin(users, eq(passwordResets.userId, users.id))
      .leftJoin(totpCredentials, eq(users.id, totpCredentials.userId))
      .leftJoin(passkeyCredentials, eq(users.id, passkeyCredentials.userId))
      .leftJoin(securityKeyCredentials, eq(users.id, securityKeyCredentials.userId))
      .where(eq(passwordResets.resetId, sessionId));
      
    if (!rows || !rows.length) {
      return { session: null, user: null };
    }
    
    const row = rows[0];
    const session = {
      id: row.password_resets.resetId,
      userId: row.password_resets.userId,
      email: row.password_resets.email,
      code: row.password_resets.code,
      expiresAt: row.password_resets.expiresAt,
      emailVerified: row.users.emailVerified,
      twoFactorVerified: row.totp_credentials != null || row.passkey_credentials != null || row.security_key_credentials != null,
    } as PasswordResetSession;
    
    const user = {
      id: row.users.id,
      email: row.users.email,
      emailVerified: row.users.emailVerified,
      registeredTOTP: row.totp_credentials != null,
      registeredPasskey: row.passkey_credentials != null,
      registeredSecurityKey: row.security_key_credentials != null,
      registered2FA: false,
    } as AuthUser;
    
    if (user.registeredTOTP || user.registeredPasskey || user.registeredSecurityKey) {
      user.registered2FA = true;
    }
    
    if (Date.now() >= session.expiresAt.getTime()) {
      await db.delete(passwordResets).where(eq(passwordResets.resetId, sessionId));
      return { session: null, user: null };
    }
    
    return { session, user };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
  try {
    await db.update(passwordResets)
      .set({ emailVerified: true })
      .where(eq(passwordResets.resetId, sessionId));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
  try {
    await db.update(passwordResets)
      .set({ mfaVerified: true })
      .where(eq(passwordResets.resetId, sessionId));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function invalidateUserPasswordResetSessions(userId: number): Promise<void> {
  try {
    await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function validatePasswordResetSessionRequest(event: RequestEvent): Promise<PasswordResetSessionValidationResult> {
	const token = event.cookies.get("password_reset_session") ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie(event);
	}
	return result;
}

export function setPasswordResetSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("password_reset_session", token, {
		expires: expiresAt,
		sameSite: "lax",
		httpOnly: true,
		path: "/",
		secure: !import.meta.env.DEV
	});
}

export function deletePasswordResetSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("password_reset_session", "", {
		maxAge: 0,
		sameSite: "lax",
		httpOnly: true,
		path: "/",
		secure: !import.meta.env.DEV
	});
}

// TODO: Setup email smtp
export function sendPasswordResetEmail(email: string, code: string): void {
	console.log(`To ${email}: Your reset code is ${code}`);
}

export interface PasswordResetSession {
	id: string;
	userId: number;
	email: string;
	expiresAt: Date;
	code: string;
	emailVerified: boolean;
	twoFactorVerified: boolean;
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: AuthUser }
	| { session: null; user: null };