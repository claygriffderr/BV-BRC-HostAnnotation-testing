
import { AppRole, UserStatus, WebServiceKey } from "../global/Types";
import { AuthService } from "../services/AuthService";
import { IApiResponse } from "../models/IApiResponse";
import { Utils } from "../helpers/Utils";
import { WebService } from "./WebService";


export class _AdminService {


   async createPerson(email_: string, firstName_: string, lastName_: string, orgUID_: string, password_: string, role_: AppRole, status_: UserStatus): Promise<boolean> {

      if (!AuthService.authState) { throw new Error("Invalid auth state"); }
      if (AuthService.authState.appRole !== AppRole.administrator) { throw new Error("You must be an administrator to perform this action"); }
      
      const errorPrefix = "Unable to create a person:";

      // Validate parameters
      email_ = Utils.safeTrim(email_);
      if (!email_) { throw new Error(`${errorPrefix} Invalid email parameter`); }

      firstName_ = Utils.safeTrim(firstName_);
      if (!firstName_) { throw new Error(`${errorPrefix} Invalid first name parameter`); }

      lastName_ = Utils.safeTrim(lastName_);
      if (!lastName_) { throw new Error(`${errorPrefix} Invalid last name parameter`); }

      if (!Object.values(AppRole).includes(role_)) { throw new Error(`${errorPrefix} Invalid role parameter`); }

      const data = {
         email: email_,
         firstName: firstName_,
         lastName: lastName_,
         orgUID: orgUID_,
         password: password_,
         role: role_,
         status: status_
      };

      const response = await WebService.postJSON<IApiResponse<boolean>>(WebServiceKey.createPerson, data);
      if (!response) { return false; }
      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return response.data as boolean;
   }

   /*
   async getParticipants(): Promise<IPerson[]> {
      return await WebService.postJSON<IPerson[]>(WebServiceKey.getParticipants);
   }

   async getProjectTeam(): Promise<IPerson[]> {
      return await WebService.postJSON<IPerson[]>(WebServiceKey.getProjectTeam);
   }

   */
}

// Create a singleton instance of _AdminService.
export const AdminService = new _AdminService();
