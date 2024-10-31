
export interface WebAuthnUserCredential {
  id: number;
  credentialId: Uint8Array;
  userId: number;
  name: string;
  algorithmId: number;
  publicKey: Uint8Array;
}
