import { encodeHexLowerCase } from "@oslojs/encoding";
import { passkeyCredentials, securityKeyCredentials } from '../../db/schema';
import { db } from '../../db';
import { and, eq } from 'drizzle-orm';

const challengeBucket = new Set<string>();

export function createWebAuthnChallenge(): Uint8Array {
	const challenge = new Uint8Array(20);
	crypto.getRandomValues(challenge);
	const encoded = encodeHexLowerCase(challenge);
	challengeBucket.add(encoded);
	return challenge;
}

export function verifyWebAuthnChallenge(challenge: Uint8Array): boolean {
	const encoded = encodeHexLowerCase(challenge);
	return challengeBucket.delete(encoded);
}

export async function getUserPasskeyCredentials(userId: number): Promise<WebAuthnUserCredential[]> {
  const credentials = (await db.select({
      id: passkeyCredentials.id,
      credentialId: passkeyCredentials.credentialId,
      userId: passkeyCredentials.userId,
      name: passkeyCredentials.name,
      algorithmId: passkeyCredentials.algorithmId,
      publicKey: passkeyCredentials.publicKey,
    })
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.userId, userId))) as unknown as WebAuthnUserCredential[];
	return credentials;
}

export async function getPasskeyCredential(credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
  return (await db.select({
    id: passkeyCredentials.id,
    userId: passkeyCredentials.userId,
    name: passkeyCredentials.name,
    algorithmId: passkeyCredentials.algorithmId,
    publicKey: passkeyCredentials.publicKey,
  })
  .from(passkeyCredentials)
  .where(eq(passkeyCredentials.credentialId, credentialId))) as unknown as WebAuthnUserCredential | null;
}

export async function getUserPasskeyCredential(userId: number, credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const rows = await db.select({
      id: passkeyCredentials.id,
      userId: passkeyCredentials.userId,
      name: passkeyCredentials.name,
      algorithmId: passkeyCredentials.algorithmId,
      publicKey: passkeyCredentials.publicKey,
    })
    .from(passkeyCredentials)
    .where(and(eq(passkeyCredentials.userId, userId), eq(passkeyCredentials.credentialId, credentialId)));
  
  const cred = rows && rows[0] as unknown;
  
  return cred as WebAuthnUserCredential | null;
}

export async function createPasskeyCredential(credential: WebAuthnUserCredential): Promise<void> {
  try {
    await db.insert(passkeyCredentials).values({
      credentialId: credential.credentialId,
      userId: credential.userId,
      name: credential.name,
      algorithmId: credential.algorithmId,
      publicKey: credential.publicKey,
    });
  } catch (err) {
    console.error('Error creating passkey credential:', err);
    throw err;
  }
}

export async function deleteUserPasskeyCredential(userId: number, credentialId: Uint8Array): Promise<boolean> {
  try {
    await db.delete(passkeyCredentials)
      .where(and(eq(passkeyCredentials.userId, userId), eq(passkeyCredentials.credentialId, credentialId)));
      
    return true;
  } catch (err) {
    console.error('Error deleting passkey credential:', err);
    return false;
  }
}

export async function getUserSecurityKeyCredentials(userId: number): Promise<WebAuthnUserCredential[]> {
	const credentials = (await db.select({
    id: securityKeyCredentials.id,
    userId: securityKeyCredentials.userId,
    name: securityKeyCredentials.name,
    algorithmId: securityKeyCredentials.algorithmId,
    publicKey: securityKeyCredentials.publicKey,
  })
  .from(securityKeyCredentials)
  .where(eq(securityKeyCredentials.userId, userId))) as unknown as WebAuthnUserCredential[];
return credentials;
}

export async function getUserSecurityKeyCredential(userId: number, credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	return (await db.select({
    id: securityKeyCredentials.id,
    userId: securityKeyCredentials.userId,
    name: securityKeyCredentials.name,
    algorithmId: securityKeyCredentials.algorithmId,
    publicKey: securityKeyCredentials.publicKey,
  })
  .from(securityKeyCredentials)
  .where(eq(securityKeyCredentials.credentialId, credentialId))) as unknown as WebAuthnUserCredential | null;
}

export async function createSecurityKeyCredential(credential: WebAuthnUserCredential): Promise<void> {
	try {
    await db.insert(securityKeyCredentials).values({
      credentialId: credential.credentialId,
      userId: credential.userId,
      name: credential.name,
      algorithmId: credential.algorithmId,
      publicKey: credential.publicKey,
    });
  } catch (err) {
    console.error('Error creating passkey credential:', err);
    throw err;
  }
}

export async function deleteUserSecurityKeyCredential(userId: number, credentialId: Uint8Array): Promise<boolean> {
	try {
    await db.delete(securityKeyCredentials)
      .where(and(eq(securityKeyCredentials.userId, userId), eq(securityKeyCredentials.credentialId, credentialId)));
      
    return true;
  } catch (err) {
    console.error('Error deleting passkey credential:', err);
    return false;
  }
}

export interface WebAuthnUserCredential {
  id: number;
	credentialId: Uint8Array;
	userId: number;
	name: string;
	algorithmId: number;
	publicKey: Uint8Array;
}