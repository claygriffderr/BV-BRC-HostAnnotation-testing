
//import { CurationType } from "../global/Types";
import { IAnnotatedHost } from "../models/IAnnotatedHost";
import { IApiResponse } from "../models/IApiResponse";
import { IHostTaxonMatch } from "../models/IHostTaxonMatch";
import { WebService } from "./WebService";
import { WebServiceKey } from "../global/Types";


export class _AnnotationService {


   async annotateHostText(hostText_: string): Promise<IAnnotatedHost> {

      const data = {
         hostText: hostText_
      }

      const response = await WebService.postJSON<IApiResponse<IAnnotatedHost>>(WebServiceKey.annotateHostText, data);
      if (!response) { return null; }
      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as IAnnotatedHost;
   }

   
   async getAnnotatedHost(hostID_: number): Promise<IAnnotatedHost> {

      const data = {
         hostID: hostID_
      }

      const response = await WebService.postJSON<IApiResponse<IAnnotatedHost>>(WebServiceKey.getAnnotatedHost, data);
      if (!response) { return null; }
      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as IAnnotatedHost;
   }

   
   async getHostTaxaMatches(hostID_: number): Promise<IHostTaxonMatch[]> {

      const data = {
         hostID: hostID_
      }

      const response = await WebService.postJSON<IApiResponse<IHostTaxonMatch[]>>(WebServiceKey.getHostTaxaMatches, data);
      if (!response) { return null; }

      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as IHostTaxonMatch[];
   }


   async searchAnnotatedHosts(searchText_: string): Promise<IAnnotatedHost[]> {

      const data = {
         searchText: searchText_
      }

      const response = await WebService.postJSON<IApiResponse<IAnnotatedHost[]>>(WebServiceKey.searchAnnotatedHosts, data);
      if (!response) { return null; }

      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as IAnnotatedHost[];
   }

}

// Create a singleton instance of _AnnotationService.
export const AnnotationService = new _AnnotationService();
