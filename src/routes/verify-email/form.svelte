<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { formSchema, type FormSchema } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
 
  export let data: SuperValidated<Infer<FormSchema>>;
 
  const form = superForm(data, {
    validators: zodClient(formSchema),
  });
 
  const { form: formData, enhance } = form;
</script>

<div class="flex flex-col gap-2">
  <form method="post" use:enhance action="?/verify">
    <Form.Field {form} name="code">
      <Form.Control let:attrs>
        <Form.Label>Code</Form.Label>
        <Input {...attrs} bind:value={$formData.code} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    
    <Form.Button>Verify Code</Form.Button>
  </form>
  
  <form action="?/resend" method="post" use:enhance>
    <Form.Button color="gray">Resend Code</Form.Button>
  </form>
</div>