<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
  import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<div class="flex lg:h-[1000px] w-full justify-center items-center">
	<Card.Root>
		<Card.Header>
			<Card.Title>Homepage</Card.Title>
		</Card.Header>
		
		<Card.Content>
			<h1>Hello, {data.user.email}!</h1>
		</Card.Content>
		
		<Card.Footer>
			<form method="post" use:enhance>
				<Button type="submit">Signout</Button>
			</form>
		</Card.Footer>
	</Card.Root>
</div>