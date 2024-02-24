
import { CurationType, TaxonomyDB } from "../global/Types";

export interface ICuratedWord {
   alternateText: string;
   alternateTextFiltered: string;
   id: number;
   isValid: boolean;
   searchText: string;
   searchTextFiltered: string;
   taxonomyDB: TaxonomyDB;
   type: CurationType;
   uid: string;
}