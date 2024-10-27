<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { formSchema, type FormSchema } from "./form-schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { encodeBase64 } from "@oslojs/encoding";
	import { createChallenge } from "$lib/client/webauthn";
  import type { AuthUser } from '../../../../db/schema';
  import type { WebAuthnUserCredential } from '$lib/server/webauthn';
  import Button from '$lib/components/ui/button/button.svelte';
 
  export let data: {
    form: SuperValidated<Infer<FormSchema>>;
    user: AuthUser;
    credentialUserId: Uint8Array;
    credentials: WebAuthnUserCredential[];
  }
  let encodedAttestationObject: string | null = null;
	let encodedClientDataJSON: string | null = null;
 
  const form = superForm(data.form, {
    validators: zodClient(formSchema),
  });
 
  const { form: formData, enhance } = form;
</script>

<Button
  variant="secondary"
	disabled={encodedAttestationObject !== null && encodedClientDataJSON !== null}
	on:click={async () => {
		const challenge = await createChallenge();

		const credential = await navigator.credentials.create({
			publicKey: {
				challenge,
				user: {
					displayName: data.user.email,
					id: data.credentialUserId,
					name: data.user.email
				},
				rp: {
					name: "SvelteKit WebAuthn example"
				},
				pubKeyCredParams: [
					{
						alg: -7,
						type: "public-key"
					},
					{
						alg: -257,
						type: "public-key"
					}
				],
				attestation: "none",
				authenticatorSelection: {
					userVerification: "required",
					residentKey: "required",
					requireResidentKey: true
				},
				excludeCredentials: data.credentials.map((credential) => {
					return {
						id: credential.credentialId,
						type: "public-key"
					};
				})
			}
		});

		if (!(credential instanceof PublicKeyCredential)) {
			throw new Error("Failed to create public key");
		}
		if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
			throw new Error("Unexpected error");
		}

		encodedAttestationObject = encodeBase64(new Uint8Array(credential.response.attestationObject));
		encodedClientDataJSON = encodeBase64(new Uint8Array(credential.response.clientDataJSON));
    $formData.attestation_object = encodedAttestationObject;
    $formData.client_data_json = encodedClientDataJSON;
	}}
>
  Create credential
</Button>
<form method="post" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Nickname</Form.Label>
			<Input {...attrs} bind:value={$formData.name} />
		</Form.Control>
    <Form.FieldErrors />
	</Form.Field>
	
	<Form.Field {form} name="attestation_object">
		<Form.Control let:attrs>
			<Input type="hidden" {...attrs} bind:value={$formData.attestation_object} />
		</Form.Control>
    <Form.FieldErrors />
	</Form.Field>
  
  <Form.Field {form} name="client_data_json">
		<Form.Control let:attrs>
			<Input type="hidden" {...attrs} bind:value={$formData.client_data_json} />
		</Form.Control>
    <Form.FieldErrors />
	</Form.Field>
  
	<Form.Button disabled={$formData.attestation_object === null && $formData.client_data_json === null}>
    Continue
  </Form.Button>
</form>