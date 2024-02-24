
import { AuthService } from "./AuthService";
import axios, { AxiosResponse } from "axios";
import { Settings } from "../global/Settings";
import { HeaderKey, WebServiceKey } from "../global/Types";


export class _WebService {


   // Make an HTTP GET request to the specified web service.
   async get<T>(webServiceKey_: WebServiceKey, data_?: any): Promise<T> {
      
      // Validate input parameters
      if (!webServiceKey_) { throw new Error("Invalid web service key"); }

      // Is the network available?
      //if (!this.isOnline()) { throw new Error("Your device is currently offline"); }

      // Lookup the web service using the key provided.
      const URL = await Settings.getWebServiceURL(webServiceKey_);
      if (!URL) { throw new Error(`Unrecognized web service key ${webServiceKey_}`); }

      // Get the auth token, but don't validate it.
      const authToken = await AuthService.getAuthToken();

      // Call the web service and wait for a response.
      let response: AxiosResponse = await axios.get(URL, {
         headers: { [HeaderKey.authToken]: authToken },
         params: data_
      })

      // Validate the Axios response.
      if (!response) { throw new Error("Invalid HTTP Response"); } 
      
      return !response.data ? null : response.data as T;
   }


   /*
   // Get the action response from the HTTP Response.
   const actionResponse: IActionResponse = response.data as IActionResponse;
   if (!actionResponse) { throw new Error("Invalid action response"); }

   // Populate the result to be returned.
   result = actionResponse.data as T;

   if (actionResponse.updateAccessToken) {

         // Get the access token from the header.
         this.tokens.access = response.headers[HeaderKey.accessToken.toLowerCase()];

         // Persist in local storage.
         await LocalNativeStorage.set(StorageKey.accessToken, this.tokens.access);
   }

   if (actionResponse.updateContextToken) {

         // Get the context token from the header.
         this.tokens.context = response.headers[HeaderKey.contentToken.toLowerCase()];
         
         // Persist in local storage.
         await LocalNativeStorage.set(StorageKey.contextToken, this.tokens.context);

         // Use the context token to upate the application context.
         await AppContextService.set(this.tokens.context);
   }
   
   if (actionResponse.messages && actionResponse.messages.length > 0) {

         let errorMessage = null;

         actionResponse.messages.forEach((message_: IActionMessage) => {
            if (message_.type === GenericStatus.error) { errorMessage = message_.text; }
         })

         console.log("about to throw an error");
         if (errorMessage && errorMessage.length > 0) { throw new Error(errorMessage); }
   }
   */


   // Make an HTTP POST request to the specified web service.
   async post<T>(webServiceKey_: WebServiceKey, formData_?: FormData): Promise<T> {

      // Validate input parameters
      if (!webServiceKey_) { throw new Error("Invalid web service key"); }

      // Is the network available?
      //if (!this.isOnline()) { throw new Error("Your device is currently offline"); }

      // Lookup the web service using the key provided.
      const URL = await Settings.getWebServiceURL(webServiceKey_);
      if (!URL) { throw new Error(`Unrecognized web service key ${webServiceKey_}`); }

      let headers = {};

      // Get the auth token and add it to the header data if it exists.
      const authToken = await AuthService.getAuthToken();
      if (!!authToken) { headers = { [HeaderKey.authToken]: authToken }; }

      // Call the web service and wait for a response.
      let response: AxiosResponse = await axios.post(URL, formData_, {
         headers: headers
      })

      // Validate the Axios response.
      if (!response) { throw new Error("Invalid HTTP Response"); } 

      return !response.data ? null : response.data as T;
   }


   // Make an HTTP POST request to the specified web service using JSON data (optional).
   async postJSON<T>(webServiceKey_: WebServiceKey, data_?: any): Promise<T> {

      // Initialize the form data.
      let formData: FormData = new FormData();
      
      if (!!data_) {

         // Convert the JSON data to form data.
         Object.keys(data_).forEach((key_: string) => {
            const value = data_[key_];
            formData.set(key_, value);
         })
      }

      return await WebService.post<T>(webServiceKey_, formData);
   }

}

// Create a singleton instance of _WebService.
export const WebService = new _WebService();
