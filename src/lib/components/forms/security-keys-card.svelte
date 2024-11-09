<script lang="ts">
  "use server"
	import { enhance } from '$app/forms';
  import * as Card from '$lib/components/ui/card';
		import type { WebAuthnUserCredential } from '$lib/types/webauthn-user-credential.model';
	import { encodeBase64 } from '@oslojs/encoding';
	import { Button } from '../ui/button';
  
  let { securityKeyCredentials } = $props<{ securityKeyCredentials: WebAuthnUserCredential[]; }>();
</script>

<Card.Root class="col-span-2">
  <Card.Header>
    <Card.Title>Security keys</Card.Title>
  </Card.Header>
  <Card.Content>
    <p class="text-sm text-neutral-500 dark:text-neutral-200 italic mb-4">
      Security keys are WebAuthn credentials that can only be used for two-factor authentication.
    </p>
    <ul>
      {#each securityKeyCredentials as credential}
        <li class="flex justify-between">
          <p>{credential.name}</p>
          <form method="post" use:enhance action="?/delete_security_key">
            <input type="hidden" name="credential_id" value={encodeBase64(credential.credentialId)} />
            <Button type="submit">Delete</Button>
          </form>
        </li>
      {/each}
      {#if securityKeyCredentials.length === 0}
        <li class="flex flex-col justify-center px-4 gap-4">
          <p>No security keys registered.</p>
          <Button href="/2fa/security-key/register" variant="outline" size="sm">Register security key</Button>
        </li>
      {/if}
    </ul>
  </Card.Content>
</Card.Root>