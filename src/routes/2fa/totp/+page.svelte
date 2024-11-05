<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { enhance } from "$app/forms";

	import type { ActionData, PageData } from "./$types";
  import Label from '$lib/components/ui/label/label.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

	let { data, form }: { data: PageData; form: ActionData; } = $props();
</script>


<div class="flex lg:h-[1000px] w-full justify-center items-center">
	<Card.Root class="max-w-lg flex-1">
		<Card.Header>
			<Card.Title>Authenticate with authenticator app</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-neutral-500 dark:text-neutral-200 italic mb-4">
				Enter the code from your app.
			</p>
			
			<form method="post" use:enhance class="flex w-full max-w-sm items-center space-x-2">
				<Input id="form-totp.code" name="code" autocomplete="one-time-code" required /><br />
				<Button type="submit">Verify</Button>
				<p>{form?.message ?? ""}</p>
			</form>
		</Card.Content>
		
		<Card.Footer class="flex flex-col gap-4">
			{#if data.user.registeredPasskey}
				<Button variant="ghost" href="/2fa/passkey">Use passkeys</Button>
			{/if}
			{#if data.user.registeredSecurityKey}
				<Button variant="ghost" href="/2fa/security-key">Use security keys</Button>
			{/if}
			
			<Button variant="ghost" href="/2fa/reset">Use recovery code</Button>
		</Card.Footer>
	</Card.Root>
</div>
