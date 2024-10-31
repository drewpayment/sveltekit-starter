// See https://kit.svelte.dev/docs/types#app

import type { Session } from './db/schema';
import type { AuthUser } from './db/auth-user.model';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: AuthUser | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
