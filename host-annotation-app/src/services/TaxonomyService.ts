
import { IApiResponse } from "../models/IApiResponse";
import { ITaxonName } from "../models/ITaxonName";
import { TaxonomyDB } from "../global/Types";
import { WebService } from "./WebService";
import { WebServiceKey } from "../global/Types";


export class _TaxonomyService {


   async getTaxonName(id_: number): Promise<ITaxonName> {

      const data = {
         id: id_
      }

      const response = await WebService.postJSON<IApiResponse<ITaxonName>>(WebServiceKey.getTaxonName, data);
      if (!response) { return null; }

      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as ITaxonName;
   }


   async searchTaxonomyDBs(searchText_: string, taxonomyDB_?: TaxonomyDB): Promise<ITaxonName[]> {

      const data = {
         searchText: searchText_,
         taxonomyDB: taxonomyDB_
      }

      const response = await WebService.postJSON<IApiResponse<ITaxonName[]>>(WebServiceKey.searchTaxonomyDBs, data);
      if (!response) { return null; }

      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as ITaxonName[];
   }


}

// Create a singleton instance of _TaxonomyService.
export const TaxonomyService = new _TaxonomyService();
