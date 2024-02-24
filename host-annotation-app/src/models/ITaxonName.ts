
import { NcbiNameClass, TaxonomyDB } from "../global/Types";

export interface ITaxonName {
   filteredName: string;
   id: number;
   isValid: boolean;
   name: string;
   nameClass: NcbiNameClass;
   rankName: string;
   taxonomyDB: TaxonomyDB;
   taxonomyID: number;
}