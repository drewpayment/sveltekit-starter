<script lang="ts">
	import { goto } from "$app/navigation";
	import { encodeBase64 } from "@oslojs/encoding";
	import { createChallenge } from "$lib/client/webauthn";
	import * as Card from '$lib/components/ui/card';

	import type { PageData } from "./$types";
  import Button from '$lib/components/ui/button/button.svelte';

	export let data: PageData;

	let message = "";
</script>

<div class="flex lg:h-[1000px] w-full justify-center items-center">
	<Card.Root class="max-w-md flex-1">
		<Card.Header>
			<Card.Title>Multi-factor Authentication</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-4">
				<Button
					on:click={async () => {
						const challenge = await createChallenge();
			
						const credential = await navigator.credentials.get({
							publicKey: {
								rpId: window.location.hostname,
								timeout: 60000,
								challenge,
								userVerification: "preferred",
								allowCredentials: data.credentials && data.credentials.map((credential) => {
									return {
										id: credential.credentialId,
										type: "public-key",
										transports: ["internal", "hybrid", "usb", "ble", "nfc"] // Support all transport methods
									};
								})
							}
						});
			
						if (!(credential instanceof PublicKeyCredential)) {
							throw new Error("Failed to create public key");
						}
						if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
							throw new Error("Unexpected error");
						}
			
						const response = await fetch("/2fa/passkey", {
							method: "POST",
							body: JSON.stringify({
								credential_id: encodeBase64(new Uint8Array(credential.rawId)),
								signature: encodeBase64(new Uint8Array(credential.response.signature)),
								authenticator_data: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
								client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
							})
						});
			
						if (response.ok) {
							goto("/");
						} else {
							message = await response.text();
						}
					}}>Use Passkey</Button
				>
	
				{#if data.user.registeredTOTP}
					<Button href="/2fa/totp" variant="ghost">Use authenticator apps</Button>
				{/if}
				{#if data.user.registeredSecurityKey}
					<Button href="/2fa/security-key" variant="ghost">Use security keys</Button>
				{/if}
				
				<Button variant="ghost" href="/2fa/reset">Use recovery code</Button>
				
				<p>{message}</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
