<script lang="ts">
	import { enhance } from "$app/forms";
	import { encodeBase64 } from "@oslojs/encoding";
	import * as Card from '$lib/components/ui/card';

	import type { PageData, ActionData } from "./$types";
  import { Input } from '$lib/components/ui/input';
  import Button from '$lib/components/ui/button/button.svelte';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex w-full px-4 my-4">
	<h1 class="text-lg md:text-4xl">Settings</h1>
</div>

<div class="w-full grid grid-cols-4 gap-6 p-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Update email</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-neutral-500 dark:text-neutral-200 italic mb-4">
				Your email: {data.user.email}
			</p>
			<form method="post" use:enhance action="?/update_email" class="flex w-full max-w-sm items-center space-x-2">
				<Input type="email" id="form-email.email" name="email" required />
				<Button type="submit">Update</Button>
			</form>
		</Card.Content>
	</Card.Root>
	
	<Card.Root>
		<Card.Header>
			<Card.Title>Update password</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="post" use:enhance action="?/update_password" class="flex w-full max-w-sm items-center space-x-2">
				<Input type="password" id="form-password.password" name="password" autocomplete="current-password" required />
				<Button type="submit">Update</Button>
			</form>
		</Card.Content>
	</Card.Root>
	
	<Card.Root>
		<Card.Header>
			<Card.Title>Authenticator app</Card.Title>
		</Card.Header>
		<Card.Content class="flex gap-2">
			{#if data.user.registeredTOTP}
				<Button href="/2fa/totp/setup">Update TOTP</Button>
				<form method="post" use:enhance action="?/disconnect_totp">
					<Button type="submit" variant="destructive">Disconnect</Button>
				</form>
			{:else}
				<Button href="/2fa/totp/setup" variant="outline">Set up TOTP</Button>
			{/if}
		</Card.Content>
	</Card.Root>
	
	{#if data.recoveryCode !== null}
		<Card.Root>
			<Card.Header>
				<Card.Title>Recovery code</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-neutral-500 dark:text-neutral-200 italic mb-4">
					Your recovery code is: <span class="font-bold not-italic text-black dark:text-white">{data.recoveryCode}</span>
				</p>
				<form method="post" use:enhance action="?/regenerate_recovery_code">
					<Button type="submit">Generate new code</Button>
				</form>
			</Card.Content>
		</Card.Root>
	{:else}
		<span>&nbsp;</span>
	{/if}
	
	<Card.Root class="col-span-2">
		<Card.Header>
			<Card.Title>Passkeys</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-neutral-500 dark:text-neutral-200 italic mb-4">
				Passkeys are WebAuthn credentials that validate your identity using your device.
			</p>
			<ul>
				{#each data.passkeyCredentials as credential}
					<li class="flex items-center px-4 gap-4">
						<p>{credential.name}</p>
						{@debug credential}
						<form method="post" use:enhance action="?/delete_passkey">
							<input type="hidden" name="id" value={credential.id} />
							<Button type="submit" variant="destructive" size="sm">Delete</Button>
						</form>
					</li>
				{/each}
			</ul>
		</Card.Content>
	</Card.Root>
	
	<Card.Root class="col-span-2">
		<Card.Header>
			<Card.Title>Security keys</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-neutral-500 dark:text-neutral-200 italic mb-4">
				Security keys are WebAuthn credentials that can only be used for two-factor authentication.
			</p>
			<ul>
				{#each data.securityKeyCredentials as credential}
					<li class="flex justify-between">
						<p>{credential.name}</p>
						<form method="post" use:enhance action="?/delete_security_key">
							<input type="hidden" name="credential_id" value={encodeBase64(credential.credentialId)} />
							<Button type="submit">Delete</Button>
						</form>
					</li>
				{/each}
				{#if data.securityKeyCredentials.length === 0}
					<li>
						<p>No security keys registered.</p>
					</li>
				{/if}
			</ul>
		</Card.Content>
	</Card.Root>
</div>
