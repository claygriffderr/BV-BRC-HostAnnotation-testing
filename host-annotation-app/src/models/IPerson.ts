
import { AppRole, UserStatus } from "../global/Types";

export interface IPerson {
   email: string;
   firstName: string;
   id: number;
   isEmailVerified: boolean;
   lastName: string;
   role: AppRole;
   status: UserStatus;
   uid: string;
}
