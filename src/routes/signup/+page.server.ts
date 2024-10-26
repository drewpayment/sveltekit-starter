import { fail, redirect } from "@sveltejs/kit";
import { checkEmailAvailability } from "$lib/server/email";
import { createUser } from "$lib/server/user";
import { RefillingTokenBucket } from "$lib/server/rate-limit";
import { verifyPasswordStrength } from "$lib/server/password";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/session";
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from "$lib/server/email-verification";
import { get2FARedirect } from "$lib/server/2fa";
import { superValidate } from "sveltekit-superforms";

import type { SessionFlags } from "$lib/server/session";
import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import { dev } from '$app/environment';

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export async function load(event: PageServerLoadEvent) {
	if (event.locals.session !== null && event.locals.user !== null) {
		if (!event.locals.user.emailVerified) {
			return redirect(302, "/verify-email");
		}
		if (!event.locals.user.registered2FA) {
			return redirect(302, "/2fa/setup");
		}
		if (!event.locals.session.mfaVerified) {
			return redirect(302, get2FARedirect(event.locals.user));
		}
		return redirect(302, "/");
	}
	
	return {
		form: await superValidate(zod(formSchema)),
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	// TODO: Assumes X-Forwarded-For is always included.
	const clientIP = event.request.headers.get("X-Forwarded-For");
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return fail(429, {
			message: "Too many requests",
			email: "",
			username: ""
		});
	}
	
	const form = await superValidate(event, zod(formSchema));
	if (!form.valid) {
		return fail(400, {
			form,
		});
	}
	
	const { email, password } = form.data;
	
	const emailAvailable = checkEmailAvailability(email);
	if (!emailAvailable) {
		return fail(400, {
			message: "Email is already used",
			email,
		});
	}
	
	const strongPassword = await verifyPasswordStrength(password);
	if (!strongPassword) {
		return fail(400, {
			message: "Weak password",
			email,
		});
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return fail(429, {
			message: "Too many requests",
			email,
		});
	}
	const user = await createUser(email, password);
	const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
	sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
	setEmailVerificationRequestCookie(event, emailVerificationRequest);

	const sessionFlags: SessionFlags = {
		twoFactorVerified: false
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	throw redirect(302, "/2fa/setup");
}