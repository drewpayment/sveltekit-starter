<script lang="ts">
	import type { PageData, ActionData } from "./$types";
  import UpdateEmailPassword from '$lib/components/forms/update-email-password.svelte';
	import AuthenticatorApp from '$lib/components/forms/authenticator-app.svelte';
	import PasskeysCard from '$lib/components/forms/passkeys-card.svelte';
	import SecurityKeysCard from '$lib/components/forms/security-keys-card.svelte';
	
	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex w-full px-4 my-4">
	<h1 class="text-lg md:text-4xl">Settings</h1>
</div>

<div class="w-full grid grid-cols-4 gap-6 p-4">
	<UpdateEmailPassword user={data.user} />
	
	<AuthenticatorApp user={data.user} recoveryCode={data.recoveryCode} />
	
	<PasskeysCard passkeyCredentials={data.passkeyCredentials} />
	
	<SecurityKeysCard securityKeyCredentials={data.securityKeyCredentials} />
</div>
