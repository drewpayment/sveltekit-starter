import type { RequestEvent } from '@sveltejs/kit';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { eq } from "drizzle-orm";
import { db } from '../../db';
import { type Session, sessions, users, type User, type AuthUser, totpCredentials, passkeyCredentials, securityKeyCredentials, type TOTPCredentials, type PasskeyCredentials, type SecurityKeyCredentials } from '../../db/schema';


export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userId: number, flags: SessionFlags): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    mfaVerified: flags.twoFactorVerified,
	} as Session;
	await db.insert(sessions).values(session);
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = (await db
		.select({ 
			user: users, 
			session: sessions, 
			totpCredentials: totpCredentials,
			passkeyCredentials: passkeyCredentials,
			securityKeyCredentials: securityKeyCredentials,
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(totpCredentials, eq(sessions.userId, totpCredentials.userId))
    .leftJoin(passkeyCredentials, eq(sessions.userId, passkeyCredentials.userId))
    .leftJoin(securityKeyCredentials, eq(sessions.userId, securityKeyCredentials.userId))
		.where(eq(sessions.sessionId, sessionId)));
    
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user: rowUser, session: rowSession, ...row } = result[0];
  
  const session: Session = {
    id: rowSession.id,
    sessionId: rowSession.sessionId,
    userId: rowSession.userId,
    expiresAt: rowSession.expiresAt,
    mfaVerified: rowSession.mfaVerified,
  };
  
  const user = {
    id: rowUser.id,
    email: rowUser.email,
    emailVerified: rowUser.emailVerified,
    registeredTOTP: row.totpCredentials != null,
    registeredPasskey: row.passkeyCredentials != null,
    registeredSecurityKey: row.securityKeyCredentials != null,
    registered2FA: row.totpCredentials != null || row.passkeyCredentials != null || row.securityKeyCredentials != null,
    role: rowUser.role,
    created: rowUser.created,
    updated: rowUser.updated,
  } as AuthUser;
  
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessions)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(sessions.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	try {
		await db.delete(sessions).where(eq(sessions.userId, userId));
	} catch (e) {
		console.error(e);
		throw e;
	}
}

export type SessionValidationResult =
	| { session: Session; user: AuthUser }
	| { session: null; user: null };


export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		expires: expiresAt,
		path: "/"
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/"
	});
}

export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
  try {
    await db.update(sessions).set({ mfaVerified: true }).where(eq(sessions.sessionId, sessionId));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export interface SessionFlags {
	twoFactorVerified: boolean;
}
