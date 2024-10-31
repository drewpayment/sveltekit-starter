<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { ActionData } from "./$types";

	export let form: ActionData;
</script>

<div class="flex lg:h-[1000px] w-full justify-center items-center">
	<Card.Root>
		<Card.Header>
			<Card.Title>Forgot your password?</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="post" use:enhance class="flex flex-col gap-2">
				<div>
					<Label for="form-forgot.email">Email</Label>
					<Input type="email" id="form-forgot.email" name="email" required value={form?.email ?? ""} />
				</div>
				<Button type="submit">Send</Button>
				<p>{form?.message ?? ""}</p>
			</form>
		</Card.Content>
		<Card.Footer>
			<Button href="/login" variant="link">Sign in instead</Button>
		</Card.Footer>
	</Card.Root>
</div>
