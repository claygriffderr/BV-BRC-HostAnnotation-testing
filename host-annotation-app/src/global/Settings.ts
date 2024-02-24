
import { WebServiceKey } from "../global/Types";

export class _Settings {

   // The version of the web service API that this app version is compliant with.
   apiVersion = "1.0.0";

   appIdentifier: string = "bvbrc_host_annotation";

   // The display names of the application.
   appLongName = "BV-BRC Host Annotation";
   appShortName = "BV-BRC Host Annotation"; 

   // The application version
   appVersion: string = "1.0.0";

   // What's the default transition time (in milliseconds) for carousel slides?
   carouselTransitionTime = 300;

   // The URL for the PAD website (???)
   //websiteURL: string = "";

   // The base URL for web services. 
   // TODO: this should be populated by src/global/app-dev.ts (dev build) or src/global/app.ts (production build).
   webServiceBaseURL: string = "https://localhost:7221/";

   
   // A lookup from web service keys to web service URLs (not including the full path).
   webServiceLookup: { [key_ in WebServiceKey]: string } = {

      // Administrator services
      // TODO

      // Annotation
      annotateHostText: "annotateHostText",
      getAnnotatedHost: "getAnnotatedHost",
      getHostTaxaMatches: "getHostTaxaMatches",
      searchAnnotatedHosts: "searchAnnotatedHosts",

      // Curated word
      createCuratedWord: "createCuratedWord",
      getCuratedWord: "getCuratedWord",
      searchCuratedWords: "searchCuratedWords",
      updateCuratedWord: "updateCuratedWord",

      // Other
      test: "test",

      // Taxonomy
      getTaxonName: "getTaxonName",
      searchTaxonomyDBs: "searchTaxonomyDBs",

      // Unauthenticated services
      login: "login"
   }



   // Return the full URL for the specified web service key.
   async getWebServiceURL(key_: WebServiceKey): Promise<string> {

      // Lookup the web service using the key provided.
      const webService = Settings.webServiceLookup[key_];
      if (!webService) { throw new Error(`Unrecognized web service key ${key_}`); }

      // Combine the web service base URL with the web service and return.
      return `${Settings.webServiceBaseURL}${webService}`;
   }


}

// Create a singleton instance of _Settings.
export const Settings = new _Settings();

