<script lang="ts">
	import { enhance } from "$app/forms";
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import Label from '$lib/components/ui/label/label.svelte';
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex w-full px-4 my-4">
	<h1 class="text-lg md:text-3xl">Setup authenticator app</h1>
</div>

<div class="flex w-full justify-center items-center">
  <Card.Root>
    <Card.Header>
      <Card.Title>Scan the QR code</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="size-52 mb-4">
        {@html data.qrcode}
      </div>
      
      <form method="post" use:enhance>
        <input name="key" value={data.encodedTOTPKey} hidden required />
        <Label for="form-totp.code">Verify the code from the app</Label>
        <Input id="form-totp.code" name="code" required /><br />
        <Button type="submit">Save</Button>
        <p>{form?.message ?? ""}</p>
      </form>
    </Card.Content>
  </Card.Root>
</div>
