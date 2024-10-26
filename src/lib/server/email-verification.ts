import { generateRandomOTP } from "./utils";
import { ExpiringTokenBucket } from "./rate-limit";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

import type { RequestEvent } from "@sveltejs/kit";
import { db } from '../../db';
import { emailVerificationRequest } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function getUserEmailVerificationRequest(userId: number, id: string): Promise<EmailVerificationRequest | null> {
  try {
    const rows = await db.select()
      .from(emailVerificationRequest)
      .where(eq(emailVerificationRequest.requestId, id));
      
    if (!rows || !rows.length) return null;
    
    const row = rows[0];
    const request = {
      id: row.requestId,
      userId: row.userId,
      code: row.code,
      email: row.email,
      expiresAt: new Date(row.expiresAt!),
    } as EmailVerificationRequest;
    
    return request;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function createEmailVerificationRequest(userId: number, email: string): Promise<EmailVerificationRequest> {
	await deleteUserEmailVerificationRequest(userId);
	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32LowerCaseNoPadding(idBytes);

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  
  try {
    await db.insert(emailVerificationRequest).values({
      requestId: id,
      userId: userId,
      code: code,
      email: email,
      expiresAt: expiresAt,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }

	const request: EmailVerificationRequest = {
		id,
		userId,
		code,
		email,
		expiresAt
	};
	return request;
}

export async function deleteUserEmailVerificationRequest(userId: number): Promise<void> {
  try {
    await db.delete(emailVerificationRequest).where(eq(emailVerificationRequest.userId, userId));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// TODO: smtp 
export function sendVerificationEmail(email: string, code: string): void {
	console.log(`To ${email}: Your verification code is ${code}`);
}

export function setEmailVerificationRequestCookie(event: RequestEvent, request: EmailVerificationRequest): void {
	event.cookies.set("email_verification", request.id, {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: request.expiresAt
	});
}

export function deleteEmailVerificationRequestCookie(event: RequestEvent): void {
	event.cookies.set("email_verification", "", {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		maxAge: 0
	});
}

export async function getUserEmailVerificationRequestFromRequest(event: RequestEvent): Promise<EmailVerificationRequest | null> {
	if (event.locals.user === null) {
		return null;
	}
	const id = event.cookies.get("email_verification") ?? null;
	if (id === null) {
		return null;
	}
	const request = await getUserEmailVerificationRequest(event.locals.user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie(event);
	}
	return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(3, 60 * 10);

export interface EmailVerificationRequest {
	id: string;
	userId: number;
	code: string;
	email: string;
	expiresAt: Date;
}