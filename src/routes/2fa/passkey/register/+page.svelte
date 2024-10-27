<script lang="ts">
	import type { PageData } from "./$types";
  import Form from './form.svelte';
	import * as Card from "$lib/components/ui/card";

	export let data: PageData;
</script>

<div class="flex lg:h-100 w-full justify-center items-center">
	<Card.Root>
		<Card.Header>
			<Card.Title>Register Passkey</Card.Title>
		</Card.Header>
		<Card.Content>
			<Form data={{
				form: data.form,
				user: data.user,
				credentialUserId: data.credentialUserId,
				credentials: data.credentials,
			}} />
		</Card.Content>
	</Card.Root>
</div>

