
import { HostTokenType, TaxonMatchType, TaxonomyDB } from "../global/Types";


export interface IHostTaxonMatch {
   customName?: string;
   customNameClass?: string;
   customRankName?: string;
   hostToken: string;
   isOneOfMany: boolean;
   matchType: TaxonMatchType;
   nameClass: string;
   rankName: string;
   taxonName: string;
   taxonNameIsValid: boolean;
   taxonomyDB: TaxonomyDB;
   taxonomyID: number;
   tokenType: HostTokenType;
}
