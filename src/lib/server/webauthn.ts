import { encodeHexLowerCase } from "@oslojs/encoding";
import { passkeyCredentials, securityKeyCredentials } from '../../db/schema';
import { db } from '../../db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { LOG_LEVEL } from '$env/static/private';

const challengeBucket = new Set<string>();

// Helper function to ensure we're working with Uint8Array
function ensureUint8Array(data: Buffer | Uint8Array): Uint8Array {
  if (data instanceof Buffer) {
      return new Uint8Array(data);
  }
  return data;
}

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
  return (await db.select({
      id: passkeyCredentials.id,
      credentialId: passkeyCredentials.credentialId,
      userId: passkeyCredentials.userId,
      name: passkeyCredentials.name,
      algorithmId: passkeyCredentials.algorithmId,
      publicKey: passkeyCredentials.publicKey,
    })
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.userId, userId))) as unknown as WebAuthnUserCredential[];
    
  // return credentials.map(credential => {
  //   return {
  //     ...credential,
  //     credentialId: Buffer.from(credential.credentialId),
  //     publicKey: Buffer.from(credential.publicKey!),
  //   };
  // });
}

export async function getPasskeyCredential(credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
  const rows = await db.select({
      id: passkeyCredentials.id,
      credentialId: passkeyCredentials.credentialId,
      userId: passkeyCredentials.userId,
      name: passkeyCredentials.name,
      algorithmId: passkeyCredentials.algorithmId,
      publicKey: passkeyCredentials.publicKey,
    })
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.credentialId, Buffer.from(credentialId)));
    
  if (!rows || !rows.length) return null;
  
  return {
    ...rows[0],
    credentialId: ensureUint8Array(rows[0].credentialId),
    publicKey: ensureUint8Array(rows[0].publicKey!),
  } as unknown as WebAuthnUserCredential;
}

export async function getUserPasskeyCredential(userId: number, credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const rows = await db.select({
      id: passkeyCredentials.id,
      credentialId: passkeyCredentials.credentialId,
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

// Helper to log binary data state
function inspectBinary(label: string, data: Buffer | Uint8Array) {
  if (LOG_LEVEL !== 'debug') return;
  console.log(`\n=== ${label} ===`);
  console.log('Type:', Object.prototype.toString.call(data));
  console.log('Constructor:', data.constructor.name);
  console.log('isBuffer:', Buffer.isBuffer(data));
  console.log('isUint8Array:', data instanceof Uint8Array);
  console.log('First byte (hex):', data[0]?.toString(16));
  console.log('Length:', data.length);
  if (data[0] === 0x7b) { // '{' character
      try {
          const str = data.toString('utf8').slice(0, 50);
          console.log('Starts with JSON:', str + '...');
      } catch (e) {}
  }
  console.log('First 10 bytes:', Array.from(data.slice(0, 10)));
  console.log('=================\n');
}

export async function createPasskeyCredential(credential: WebAuthnUserCredential): Promise<void> {
  // Log incoming data
  inspectBinary('Incoming credentialId', credential.credentialId);
  inspectBinary('Incoming publicKey', credential.publicKey);
  
  // Create binary buffers explicitly
  const credentialIdBuffer = Buffer.from(
      credential.credentialId.buffer, 
      credential.credentialId.byteOffset, 
      credential.credentialId.length
  );
  
  const publicKeyBuffer = Buffer.from(
      credential.publicKey.buffer,
      credential.publicKey.byteOffset,
      credential.publicKey.length
  );
  
  // Log after conversion
  inspectBinary('credentialId as Buffer', credentialIdBuffer);
  inspectBinary('publicKey as Buffer', publicKeyBuffer);
  
  try {
    await db.insert(passkeyCredentials).values({
      credentialId: credentialIdBuffer,
      userId: credential.userId,
      name: credential.name,
      algorithmId: credential.algorithmId,
      publicKey: publicKeyBuffer,
    });
  } catch (err) {
    console.error('Error creating passkey credential:', err);
    throw err;
  }
}

function compareCredentialIds(a: Buffer | Uint8Array, b: Buffer | Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export async function deleteUserPasskeyCredential(userId: number, passkeyId: number): Promise<boolean> {
  try {
    // Delete by primary key instead of binary data
    const result = await db.delete(passkeyCredentials)
      .where(and(eq(passkeyCredentials.id, passkeyId), eq(passkeyCredentials.userId, userId)))
      .returning({ id: passkeyCredentials.id });
      
    const deleted = result.length > 0;
    
    return deleted;
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