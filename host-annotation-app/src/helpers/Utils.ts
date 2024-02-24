
import { TaxonomyDB, TaxonomyDbLookup } from "../global/Types";


export class Utils {


   static CreateTaxonomyDbLink(taxonomyDB_: TaxonomyDB, taxonomyID_: number) {

      if (!taxonomyDB_ || !taxonomyID_) { return ""; }

      const taxonomyDbLabel = TaxonomyDbLookup(taxonomyDB_);

      let idType = "";
      let url = "";

      switch (taxonomyDB_) {
         case TaxonomyDB.itis:
            idType = "TSN";
            url = `https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=${taxonomyID_}#null`;
            break;

         case TaxonomyDB.ncbi:
            idType = "tax_id";
            url = `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${taxonomyID_}`;
            break;

         default: return "";
      }

      return `<a href="${url}" target="_blank">View ${taxonomyDbLabel} ${idType} ${taxonomyID_}</a>`;
   }

   

   // Get a specific query string parameter.
   static async getParam(name_: string): Promise<string> {

      const params = await Utils.getParams();
      if (!params) { return null; }

      return params[name_];
   }

   // Get any/all query string parameters.
   static async getParams(): Promise<any> {
      
      const qmIndex = window.location.href.lastIndexOf("?");
      if (isNaN(qmIndex) || qmIndex < 1) { return null; }

      const queryString = window.location.href.substring(qmIndex + 1);
      if (!queryString || queryString.length < 1) { return null; }

      const nameValues = queryString.split("&");
      if (!Array.isArray(nameValues)) { return null; }

      let params = {};

      // Iterate over every name value pair in the query string.
      nameValues.forEach((nameValue_: string) => {
         const equalsIndex = nameValue_.indexOf("=");
         if (isNaN(equalsIndex) || equalsIndex < 1) { return; }

         // Get the name and value.
         let name = nameValue_.substring(0, equalsIndex);
         let value = nameValue_.substring(equalsIndex + 1);

         params[name] = value;
      })
      
      return params;
   }


   // Get the width of the browser / window.
   // (Courtesy of https://stackoverflow.com/users/307338/travis in https://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code)
   static getWindowWidth(): number {
      return Math.max(
         document.body.scrollWidth,
         document.documentElement.scrollWidth,
         document.body.offsetWidth,
         document.documentElement.offsetWidth,
         document.documentElement.clientWidth
      );
   }
   
   static isNullOrEmpty(text_: string): boolean {

      if (!text_) { return false; }

      text_ = text_.trim();
      if (text_.length < 1) { return false; }

      return true;
   }

   static safeTrim(text_: string): string {
      return !text_? null : text_.trim();
   }

   // Based on the window width, could this be a mobile device?
   static useMobileLayout(): boolean {
      return (600 > this.getWindowWidth());
   }

}

