
import { AppRole } from "../global/Types";

export interface ILoginResult {
   isAuthenticated: boolean;
   message: string;
   role: AppRole;
   statusCode: string; // ???
}