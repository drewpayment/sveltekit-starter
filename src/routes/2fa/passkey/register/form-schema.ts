import { z } from 'zod';

export const formSchema = z.object({
  name: z.string(),
  attestation_object: z.string(),
  client_data_json: z.string(),
});

export type FormSchema = typeof formSchema;