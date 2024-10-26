<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	import type { ActionData, PageData } from "./$types";
  import Form from './form.svelte';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex lg:h-[1000px] w-full justify-center items-center">
	<Card.Root>
		<Card.Header>
			<Card.Title>Verify your email address</Card.Title>
			<Card.Description>
				<p>We sent an 8-digit code to {data.email}.</p>
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Form data={data.form} />
		</Card.Content>
		<Card.Footer>
			<p>{form?.resend?.message ?? ""}</p>
			<a href="/settings">Change your email</a>
		</Card.Footer>
	</Card.Root>
</div>
