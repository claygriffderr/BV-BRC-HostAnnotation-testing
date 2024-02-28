
/*
import { IPerson } from "../models/IPerson";
import { WebService } from "./WebService";
import { WebServiceKey } from "../global/Types";
*/

export class _AdminService {

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
