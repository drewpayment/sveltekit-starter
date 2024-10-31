<script lang="ts">
  "use server"
	import { enhance } from '$app/forms';
  import * as Card from '$lib/components/ui/card';
	import type { AuthUser } from '$lib/types/auth-user.model';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';
  
  export let user: AuthUser;
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
    
    <form method="post" use:enhance action="?/update_password" class="flex flex-col w-full gap-2 mt-4">
      <div>
        <Label>Password</Label>
        <Input type="password" id="form-password.password" name="password" autocomplete="current-password" required />
      </div>
      
      <div>
        <Label>Confirm Password</Label>
        <Input type="password" id="form-password.confirmPassword" name="confirmPassword" autocomplete="new-password" required />
      </div>
      
      <Button type="submit" class="mt-2">Update</Button>
    </form>
  </Card.Content>
</Card.Root>