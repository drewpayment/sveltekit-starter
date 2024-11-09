<script lang="ts">
	import { enhance } from "$app/forms";
	import { createChallenge } from "$lib/client/webauthn";
	import { encodeBase64 } from "@oslojs/encoding";
	import { goto } from "$app/navigation";
	import * as Card from '$lib/components/ui/card';
  import LoginForm from './login-form.svelte';
  import type { PageData } from '../$types';
  import Button from '$lib/components/ui/button/button.svelte';

	let { data }: { data: PageData } = $props<{ data: PageData }>();

	let passkeyErrorMessage = $state({} as { message: string });
</script>

<div class="flex lg:h-[1000px] w-full justify-center items-center">
	<Card.Root class="max-w-lg flex-1">
		<Card.Header>
			<Card.Title>Sign In</Card.Title>
		</Card.Header>
		<Card.Content>
			<LoginForm data={data.form} />
		</Card.Content>
		<Card.Footer class="flex flex-col justify-start items-start">
			<div>
				<Button
					variant="outline"
					onclick={async () => {
						const challenge = await createChallenge();
			
						const credential = await navigator.credentials.get({
							publicKey: {
								challenge,
								userVerification: "required"
							}
						});
			
						if (!(credential instanceof PublicKeyCredential)) {
							throw new Error("Failed to create public key");
						}
						if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
							throw new Error("Unexpected error");
						}
			
						const response = await fetch("/login/passkey", {
							method: "POST",
							// this example uses JSON but you can use something like CBOR to get something more compact
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
							passkeyErrorMessage = await response.json();
						}
					}}>Sign in with passkeys</Button
				>
				<p class="text-red-500">{passkeyErrorMessage.message}</p>
			</div>
			<a href="/signup">Create an account</a>
			<a href="/forgot-password">Forgot password?</a>
		</Card.Footer>
	</Card.Root>
</div>
