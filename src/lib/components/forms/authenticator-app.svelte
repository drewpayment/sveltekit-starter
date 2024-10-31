<script lang="ts">
  "use server"
	import { enhance } from '$app/forms';
  import * as Card from '$lib/components/ui/card';
	import type { AuthUser } from '../../types/auth-user.model';
	import { Button } from '../ui/button';
  
  export let user: AuthUser;
  export let recoveryCode: string | null;
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Authenticator app</Card.Title>
  </Card.Header>
  <Card.Content class="flex flex-col gap-2">
    <div class="flex gap-2">
      {#if user.registeredTOTP}
        <Button href="/2fa/totp/setup">Update TOTP</Button>
        <form method="post" use:enhance action="?/disconnect_totp">
          <Button type="submit" variant="destructive">Disconnect</Button>
        </form>
      {:else}
        <Button href="/2fa/totp/setup" variant="outline">Set up TOTP</Button>
      {/if}
    </div>
    
    {#if recoveryCode !== null}
      <h3 class="text-lg font-semibold leading-none tracking-tight mt-8">Recovery code</h3>
      <div class="py-2">
        <p class="text-neutral-500 dark:text-neutral-200 italic mb-4">
          Your recovery code is: <span class="font-bold not-italic text-black dark:text-white">{recoveryCode}</span>
        </p>
        <form method="post" use:enhance action="?/regenerate_recovery_code">
          <Button type="submit">Generate new code</Button>
        </form>
      </div>
    {/if}
  </Card.Content>
</Card.Root>