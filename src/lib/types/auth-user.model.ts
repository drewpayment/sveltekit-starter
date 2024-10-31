import type { User } from '../../db/schema';


export interface AuthUser extends User {
  registeredTOTP: boolean;
  registeredSecurityKey: boolean;
  registeredPasskey: boolean;
  registered2FA: boolean;
}