
import { TaxonomyDB } from "../global/Types";

export interface IAnnotatedHost {
   algorithmID: number;
   classCommonName: string;
   classScientificName: string;
   commonName: string;
   hostID: number;
   hostText: string;
   id: number;
   isAvian: boolean;
   rankName: string;
   scientificName: string;
   score: number;
   status: string;
   statusDetails: string;
   synonyms: string;
   taxonNameMatchID: number;
   taxonomyDB: TaxonomyDB;
   taxonomyID: number;
}