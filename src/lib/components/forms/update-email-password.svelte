<script lang="ts">
  "use server"
	import { enhance } from '$app/forms';
  import * as Card from '$lib/components/ui/card';
	import type { AuthUser } from '$lib/types/auth-user.model';
	import type { ActionResult } from '@sveltejs/kit';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';
  
  let { user } = $props<{ user: AuthUser }>();
  
  let hasIncorrectPassword = $state(false);
  let hasError = $state(false);
  let hasServerError = $state(false);
  let serverErrorMessage = $state('');
  
  const parseServerError = (result: ActionResult<Record<string, unknown>>) => {
    const data = 'data' in result ? result.data : null;
    
    if (result.type !== 'failure' && result.type !== 'error') return;
    
    const password = (data && 'password' in data ? data.password : null) as { message: string };
    
    if (!password) return;
    
    hasIncorrectPassword = password.message === 'Incorrect password';
    hasServerError = password.message !== 'Invalid or missing fields';
    
    if (hasServerError) {
      serverErrorMessage = password.message;
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Update Email / Password</Card.Title>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance action="?/update_email" class="flex w-full max-w-sm items-end space-x-2">
      <div>
        <Label>Email</Label>
        <Input type="email" id="form-email.email" name="email" placeholder={user.email} required />
      </div>
      <Button type="submit">Update</Button>
    </form>
    
    <form method="post" action="?/update_password" class="flex flex-col w-full gap-2 mt-4"
      use:enhance={({formData, cancel}) => {
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
          hasError = true;
          cancel();
          return;
        } else {
          hasError = false;
        }
        
        return ({ result }) => { 
        
          if (result.status === 400 && 'data' in result && result.data && result.data.password && 
            result.data.password.message === 'Invalid or missing fields'
          ) {
            hasIncorrectPassword = true;
          } else if (result.status === 400 && 'data' in result && result.data && result.data.message) {
            
          }
          
        }
      }}
    >
      <div>
        <Label>Current Password</Label>
        <Input type="password" class={hasIncorrectPassword ? 'border-red-500' : ''}
          id="form-password.currentPassword" name="currentPassword" autocomplete="current-password" required />
        {#if hasIncorrectPassword}
          <p class="text-red-500 text-sm">That password is incorrect.</p>
        {/if}
      </div>
    
      <div>
        <Label>Password</Label>
        <Input type="password" class={hasError ? 'border-red-500' : ''}
          id="form-password.password" name="password" autocomplete="current-password" required />
      </div>
      
      <div>
        <Label>Confirm Password</Label>
        <Input type="password" class={hasError ? 'border-red-500' : ''}
          id="form-password.confirmPassword" name="confirmPassword" autocomplete="new-password" required />
        {#if hasError}
          <p class="text-red-500 text-sm">Your password does not match.</p>
        {/if}
      </div>
      
      <Button type="submit" class="mt-2">Update</Button>
      {#if hasServerError}
        <p class="text-red-500 text-sm">{serverErrorMessage}</p>
      {/if}
    </form>
  </Card.Content>
</Card.Root>