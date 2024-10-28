import {
	coseAlgorithmES256,
	createAssertionSignatureMessage,
	coseAlgorithmRS256
} from "@oslojs/webauthn";
import { decodePKIXECDSASignature, decodeSEC1PublicKey, p256, verifyECDSASignature } from "@oslojs/crypto/ecdsa";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { decodeBase64 } from "@oslojs/encoding";
import { getPasskeyCredential } from "$lib/server/webauthn";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/session";
import { sha256 } from "@oslojs/crypto/sha2";

import type { RequestEvent } from "./$types";
import type { SessionFlags } from "$lib/server/session";


export async function POST(context: RequestEvent): Promise<Response> {
	const data: unknown = await context.request.json();
	const parser = new ObjectParser(data);
	
	try {
			const encodedAuthenticatorData = parser.getString("authenticator_data");
			const encodedClientDataJSON = parser.getString("client_data_json");
			const encodedCredentialId = parser.getString("credential_id");
			const encodedSignature = parser.getString("signature");

			const authenticatorDataBytes = decodeBase64(encodedAuthenticatorData);
			const clientDataJSON = decodeBase64(encodedClientDataJSON);
			const credentialId = decodeBase64(encodedCredentialId);
			const signatureBytes = decodeBase64(encodedSignature);

			const credential = await getPasskeyCredential(credentialId);
			if (!credential) {
					return new Response("Invalid credential", { status: 400 });
			}

			// Create and hash the message that was signed
			const messageToVerify = createAssertionSignatureMessage(
					authenticatorDataBytes,
					clientDataJSON
			);
			const hash = sha256(messageToVerify);

			if (credential.algorithmId === coseAlgorithmES256) {
					// Decode the DER signature into r and s components
					const signature = decodePKIXECDSASignature(signatureBytes);
					
					// Decode the public key from SEC1 format
					const publicKey = decodeSEC1PublicKey(p256, credential.publicKey);
					
					// Verify the signature
					const validSignature = verifyECDSASignature(
							publicKey,
							hash,
							signature
					);
					
					if (!validSignature) {
							return new Response("Invalid signature", { status: 400 });
					}
			} else if (credential.algorithmId === coseAlgorithmRS256) {
					// ... RS256 handling remains the same
					return new Response("RSA signatures not implemented", { status: 400 });
			} else {
					return new Response("Unsupported algorithm", { status: 400 });
			}

			const sessionFlags: SessionFlags = { twoFactorVerified: true };
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, credential.userId, sessionFlags);
			setSessionTokenCookie(context, sessionToken, session.expiresAt);
			
			return new Response(null, { status: 204 });
	} catch (error) {
			console.error('Verification error:', error);
			if (error instanceof Error) {
					console.error('Error details:', error.message);
					console.error('Stack trace:', error.stack);
			}
			return new Response("Invalid signature", { status: 400 });
	}
}
