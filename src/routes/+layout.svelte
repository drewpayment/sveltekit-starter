<script lang="ts">
	import { enhance } from '$app/forms';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import { Button } from '$lib/components/ui/button';
	import "../app.css";
	import type { LayoutServerData } from './$types';
	
	let { data } = $props<{ data: LayoutServerData }>();
</script>

<svelte:head>
	<title>{PUBLIC_APP_NAME}</title>
</svelte:head>

<div class="w-full">
	<nav class="flex items-center justify-between flex-wrap bg-teal-500 p-6">
		<div class="flex items-center flex-shrink-0 text-white mr-6">
			<a href="/" class="flex mr-2">
				<svg class="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z"/></svg>
				<span class="font-semibold text-xl tracking-tight">Starter</span>
			</a>
		</div>
		<div class="block md:hidden">
			<button class="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
				<svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
			</button>
		</div>
		<div class="w-full sm:hidden md:flex flex-grow md:items-center md:w-auto">
			<div class="text-sm md:flex-grow">
				<a href="/" class="mt-4 hidden md:inline-block md:mt-0 text-teal-200 hover:text-white mr-4">
					Home
				</a>
				<a href="/settings" class="mt-4 hidden md:inline-block md:mt-0 text-teal-200 hover:text-white mr-4">
					Settings
				</a>
			</div>
			<div>
				{#if data.user}
					<form method="post" action="/" use:enhance>
						<Button type="submit" variant="ghost" class="hidden md:inline-block text-teal-200">Sign Out</Button>
					</form>
					<!-- <a href="/" class="mt-4 sm:hidden md:inline-block md:mt-0 text-teal-200 hover:text-white mr-4">
						Signout
					</a> -->
				{:else}
					<form method="post" action="/" use:enhance>
						<Button type="submit" variant="ghost" class="hidden md:inline-block text-teal-200">Sign In</Button>
					</form>
				{/if}
			</div>
		</div>
	</nav>
	
	<div class="p-4">
		<slot />
	</div>
</div>