<script lang="ts">
  "use server"
	import { enhance } from '$app/forms';
  import * as Card from '$lib/components/ui/card';
		import type { WebAuthnUserCredential } from '$lib/types/webauthn-user-credential.model';
	import { Button } from '../ui/button';
  
  let { passkeyCredentials } = $props<{
    passkeyCredentials: WebAuthnUserCredential[];
  }>();
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Passkeys</Card.Title>
  </Card.Header>
  <Card.Content>
    <p class="text-sm text-neutral-500 dark:text-neutral-200 italic mb-4">
      Passkeys are WebAuthn credentials that validate your identity using your device.
    </p>
    <ul>
      {#each passkeyCredentials as credential}
        <li class="flex items-center px-4 gap-4">
          <p>{credential.name}</p>
          <form method="post" use:enhance action="?/delete_passkey">
            <input type="hidden" name="id" value={credential.id} />
            <Button type="submit" variant="destructive" size="sm">Delete</Button>
          </form>
        </li>
      {/each}
      {#if passkeyCredentials.length === 0}
        <li class="flex flex-col justify-center px-4 gap-4">
          <p>No passkeys registered.</p>
          <Button href="/2fa/passkey/register" variant="outline" size="sm">Register passkey</Button>
        </li>	
      {/if}
    </ul>
  </Card.Content>
</Card.Root>