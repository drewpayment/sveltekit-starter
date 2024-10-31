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
			<Card.Title>Enter your new password</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="post" class="flex flex-col gap-2" use:enhance={({formData, cancel}) => {
				const password = formData.get("password");
				const confirmPassword = formData.get("confirm-password");
				
				if (password !== confirmPassword) {
					cancel();
				} 
				
				return ({ result, update }) => {
					console.log(result);
				}
			}}>
				<div>
					<Label for="form-reset.password">Password</Label>
					<Input type="password" id="form-reset.password" name="password" 
						autocomplete="new-password" required />
				</div>
				<div>
					<Label for="form-reset.passwordConfirm">Confirm password</Label>
					<Input type="password" id="form-reset.confirm-password" name="confirm-password" 
						autocomplete="new-password" required />
				</div>
				<Button type="submit" class="mt-4">Reset password</Button>
			</form>
		</Card.Content>
		<Card.Footer>
			<p>{form?.message ?? ""}</p>
		</Card.Footer>
	</Card.Root>
</div>
