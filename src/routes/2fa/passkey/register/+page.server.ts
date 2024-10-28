import { fail, redirect } from "@sveltejs/kit";
import { get2FARedirect } from "$lib/server/2fa";
import { bigEndian } from "@oslojs/binary";
import {
	parseAttestationObject,
	AttestationStatementFormat,
	parseClientDataJSON,
	coseAlgorithmES256,
	coseEllipticCurveP256,
	ClientDataType,
	coseAlgorithmRS256
} from "@oslojs/webauthn";
import { ECDSAPublicKey, p256 } from "@oslojs/crypto/ecdsa";
import { decodeBase64 } from "@oslojs/encoding";
import { verifyWebAuthnChallenge, createPasskeyCredential, getUserPasskeyCredentials } from "$lib/server/webauthn";
import { setSessionAs2FAVerified } from "$lib/server/session";
import { RSAPublicKey } from "@oslojs/crypto/rsa";

import type { WebAuthnUserCredential } from "$lib/server/webauthn";
import type {
	AttestationStatement,
	AuthenticatorData,
	ClientData,
	COSEEC2PublicKey,
	COSERSAPublicKey,
	WebAuthnCredential
} from "@oslojs/webauthn";
import type { Actions, RequestEvent } from "./$types";
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './form-schema';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, "/login");
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, "/verify-email");
	}
	if (event.locals.user.registered2FA && !event.locals.session.mfaVerified) {
		return redirect(302, get2FARedirect(event.locals.user));
	}

	const credentials = await getUserPasskeyCredentials(event.locals.user.id);

	const credentialUserId = new Uint8Array(8);
	bigEndian.putUint64(credentialUserId, BigInt(event.locals.user.id), 0);

	return {
		credentials,
		credentialUserId,
		user: event.locals.user,
		form: await superValidate(zod(formSchema)),
	};
}

export const actions: Actions = {
	default: action
};

// Helper functions for key encoding/decoding
function encodePublicKey(credential: WebAuthnCredential): Uint8Array {
	const publicKey = credential.publicKey;

	if (publicKey.algorithm() === coseAlgorithmES256) {
		const coseKey = publicKey.ec2();
		if (coseKey.curve !== coseEllipticCurveP256) {
			throw new Error("Unsupported curve");
		}

		// Ensure we're using the standardized SEC1 uncompressed format
		// This should start with 0x04 followed by the x and y coordinates
		const key = new ECDSAPublicKey(p256, coseKey.x, coseKey.y);
		return key.encodeSEC1Uncompressed();
	} else if (publicKey.algorithm() === coseAlgorithmRS256) {
		const coseKey = publicKey.rsa();
		const key = new RSAPublicKey(coseKey.n, coseKey.e);
		return key.encodePKCS1();
	}

	throw new Error("Unsupported algorithm");
}

// Function to create a credential during registration
async function createNewCredential(
	authenticatorData: AuthenticatorData,
	userId: number,
	name: string
): Promise<WebAuthnUserCredential> {
	if (!authenticatorData.credential) {
		throw new Error("No credential in authenticator data");
	}

	const algorithmId = authenticatorData.credential.publicKey.algorithm();
	if (algorithmId !== coseAlgorithmES256 && algorithmId !== coseAlgorithmRS256) {
		throw new Error("Unsupported algorithm");
	}

	try {
		const encodedPublicKey = encodePublicKey(authenticatorData.credential);

		return {
			credentialId: Buffer.from(authenticatorData.credential.id),
			userId,
			algorithmId,
			name,
			publicKey: Buffer.from(encodedPublicKey),
		} as unknown as WebAuthnUserCredential;
	} catch (error) {
		console.error('Error encoding public key:', error);
		throw error;
	}
}


async function action(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			message: "Not authenticated"
		});
	}
	if (!event.locals.user.emailVerified) {
		return fail(403, {
			message: "Forbidden"
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.mfaVerified) {
		return fail(403, {
			message: "Forbidden"
		});
	}

	const form = await superValidate(event, zod(formSchema));
	const {
		name,
		attestation_object: encodedAttestationObject,
		client_data_json: encodedClientDataJSON
	} = form.data;

	if (!form.valid) return fail(400, { form });

	if (
		typeof name !== "string" ||
		typeof encodedAttestationObject !== "string" ||
		typeof encodedClientDataJSON !== "string"
	) {
		return fail(400, {
			message: "Invalid or missing fields"
		});
	}

	let attestationObjectBytes: Uint8Array, clientDataJSON: Uint8Array;
	try {
		attestationObjectBytes = decodeBase64(encodedAttestationObject);
		clientDataJSON = decodeBase64(encodedClientDataJSON);
	} catch {
		return fail(400, {
			message: "Invalid or missing fields"
		});
	}

	let attestationStatement: AttestationStatement;
	let authenticatorData: AuthenticatorData;
	try {
		const attestationObject = parseAttestationObject(attestationObjectBytes);
		attestationStatement = attestationObject.attestationStatement;
		authenticatorData = attestationObject.authenticatorData;
	} catch {
		return fail(400, {
			message: "Invalid data"
		});
	}
	if (attestationStatement.format !== AttestationStatementFormat.None) {
		return fail(400, {
			message: "Invalid data"
		});
	}
	// TODO: Update host
	if (!authenticatorData.verifyRelyingPartyIdHash("localhost")) {
		return fail(400, {
			message: "Invalid data"
		});
	}
	if (!authenticatorData.userPresent || !authenticatorData.userVerified) {
		return fail(400, {
			message: "Invalid data"
		});
	}
	if (authenticatorData.credential === null) {
		return fail(400, {
			message: "Invalid data"
		});
	}

	let clientData: ClientData;
	try {
		clientData = parseClientDataJSON(clientDataJSON);
	} catch {
		return fail(400, {
			message: "Invalid data"
		});
	}
	if (clientData.type !== ClientDataType.Create) {
		return fail(400, {
			message: "Invalid data"
		});
	}

	if (!verifyWebAuthnChallenge(clientData.challenge)) {
		return fail(400, {
			message: "Invalid data"
		});
	}
	// TODO: Update origin
	if (clientData.origin !== "http://localhost:5173") {
		return fail(400, {
			message: "Invalid data"
		});
	}
	if (clientData.crossOrigin !== null && clientData.crossOrigin) {
		return fail(400, {
			message: "Invalid data"
		});
	}

	let credential = await createNewCredential(authenticatorData, event.locals.user.id, name);

	// We don't have to worry about race conditions since queries are synchronous
	const credentials = await getUserPasskeyCredentials(event.locals.user.id);
	if (credentials.length >= 5) {
		return fail(400, {
			message: "Too many credentials"
		});
	}

	try {
		await createPasskeyCredential(credential);
	} catch (e) {
		return fail(500, {
			message: "Internal error"
		});
	}

	if (!event.locals.session.mfaVerified) {
		await setSessionAs2FAVerified(event.locals.session.sessionId);
	}

	if (!event.locals.user.registered2FA) {
		return redirect(302, "/recovery-code");
	}
	return redirect(302, "/");
}