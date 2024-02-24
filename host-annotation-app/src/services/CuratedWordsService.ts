
import { CurationType } from "../global/Types";
import { IApiResponse } from "../models/IApiResponse";
import { ICuratedWord } from "../models/ICuratedWord";
import { WebService } from "./WebService";
import { WebServiceKey } from "../global/Types";


export class _CuratedWordsService {


   async getCuratedWord(id_: number): Promise<ICuratedWord> {

      const data = {
         id: id_
      }

      const response = await WebService.postJSON<IApiResponse<ICuratedWord>>(WebServiceKey.getCuratedWord, data);
      if (!response) { return null; }

      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as ICuratedWord;
   }


   async searchCuratedWords(searchText_: string, type_?: CurationType): Promise<ICuratedWord[]> {

      const data = {
         searchText: searchText_,
         type: type_
      }

      const response = await WebService.postJSON<IApiResponse<ICuratedWord[]>>(WebServiceKey.searchCuratedWords, data);
      if (!response) { return null; }

      if (response.statusCode !== "OK") { throw new Error(response.message); }

      return !response.data ? null : response.data as ICuratedWord[];
   }


}

// Create a singleton instance of _CuratedWordsService.
export const CuratedWordsService = new _CuratedWordsService();
