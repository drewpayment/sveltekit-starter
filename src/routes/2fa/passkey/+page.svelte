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
	<Card.Root class="max-w-lg flex-1">
		<Card.Header>
			<Card.Title>Authenticate with Passkey</Card.Title>
		</Card.Header>
		<Card.Content>
			<div>
				<Button
					on:click={async () => {
						const challenge = await createChallenge();
			
						const credential = await navigator.credentials.get({
							publicKey: {
								rpId: window.location.hostname,
								timeout: 60000,
								challenge,
								userVerification: "preferred",
								allowCredentials: data.credentials.map((credential) => {
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
					}}>Authenticate</Button
				>
				<p>{message}</p>
			</div>
		</Card.Content>
		
		<Card.Footer>
			<Button variant="link" href="/2fa/reset">Use recovery code</Button>
	
			{#if data.user.registeredTOTP}
				<a href="/2fa/totp">Use authenticator apps</a>
			{/if}
			{#if data.user.registeredSecurityKey}
				<a href="/2fa/security-key">Use security keys</a>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
