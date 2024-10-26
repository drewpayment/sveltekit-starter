<script lang="ts">
  import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';
  import SignupForm from './signup-form.svelte';
	
	export let data: PageData;
</script>

<div class="flex lg:h-[1000px] w-full justify-center items-center">
	<Card.Root class="max-w-lg flex-1">
		<Card.Header>
			<h1>Create an account</h1>
		</Card.Header>
		<Card.Content>
			<SignupForm data={data.form} />
		</Card.Content>
		<Card.Footer>
			<a class="hover:underline" href="/login">Existing account? Sign in</a>
		</Card.Footer>
	</Card.Root>
</div>