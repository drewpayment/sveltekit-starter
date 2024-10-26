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

<form method="post" use:enhance action="?/verify">
	<Form.Field {form} name="code">
		<Form.Control let:attrs>
			<Form.Label>Code</Form.Label>
			<Input {...attrs} bind:value={$formData.code} />
		</Form.Control>
    <Form.FieldErrors />
	</Form.Field>
  
	<Form.Button>Resend Code</Form.Button>
</form>