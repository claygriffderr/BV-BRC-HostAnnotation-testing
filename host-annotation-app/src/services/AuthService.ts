
import { AuthState } from "../models/AuthState";
import axios, { AxiosResponse } from "axios";
import { ILoginResult } from "../models/ILoginResult";
import { LocalDataStorage } from "./LocalDataStorage";
import { Settings } from "../global/Settings";
import { AppRole, IAuthState, IAuthStateCallback, HeaderKey, StorageKey, WebServiceKey } from "../global/Types";
import { ILoginParameters } from "../models/ILoginParameters";


export class _AuthService {

   // The user's current authentication / authorization state.
   authState: AuthState;

   // A callback function provided by AppRoot so it can be informed about AuthState updates.
   updateAppRoot: IAuthStateCallback;


   // C-tor
   constructor() {
      // TODO: possibly unnecessary...
      this.authState = new AuthState();
   }


   // Return the user's application role.
   async getAppRole(): Promise<AppRole> {
      return (!this.authState || !this.authState.appRole) ? AppRole.unknown : this.authState.appRole;
   }


   // Return the user's auth token.
   async getAuthToken(): Promise<string> {
      return !this.authState ? null : this.authState.authToken;
   }


   // Return the user's authentication status.
   async isAuthenticated(): Promise<boolean> {
      return !this.authState ? false : this.authState.isAuthenticated;
   }


   // Look for a persisted AuthState in data storage.
   async loadAuthState() {

      this.authState = await LocalDataStorage.get<IAuthState>(StorageKey.authState);
      if (!this.authState) { this.authState = new AuthState(); }

      // Provide the AppRoot with the updated AuthState.
      this.updateAppRoot({...this.authState});
   }

   
   // Log the user in.
   async login(email_: string, password_: string): Promise<ILoginResult> {

      // Validate the email parameter.
      email_ = !email_ ? null : email_.trim();
      if (!email_) { throw new Error("Invalid email address (empty)"); }

      // Validate the password parameter.
      password_ = !password_ ? null : password_.trim();
      if (!password_) { throw new Error("Invalid password (empty)"); }

      // This will be provided in the HTTP Request as a JSON object.
      const loginParameters: ILoginParameters = {
         email: email_,
         password: password_
      }

      // Is the network available?
      //if (!this.isOnline()) { throw new Error("Your device is currently offline"); }

      // Lookup the auth web service.
      const URL = await Settings.getWebServiceURL(WebServiceKey.login);
      if (!URL) { throw new Error(`Invalid web service key for auth`); }

      // Call the web service and wait for a response.
      let response: AxiosResponse = await axios.post(URL, loginParameters);

      // Validate the Axios response.
      if (!response || !response.data) { throw new Error("Invalid HTTP Response"); }

      // Reset the AuthState before we update it.
      this.authState = new AuthState();

      // Look for an auth token in the headers and update the AuthState.
      this.authState.authToken = response.headers[HeaderKey.authToken];
      if (!this.authState.authToken || this.authState.authToken.length < 1) { this.authState.authToken = null; }

      // Try to use the the login result to update the AuthState.
      const loginResult = response.data as ILoginResult;
      if (loginResult) {
         this.authState.appRole = loginResult.role;
         this.authState.isAuthenticated = loginResult.isAuthenticated;
      }
      
      // Save the updated AuthState.
      await this.saveAuthState();

      // Provide the AppRoot with the updated AuthState.
      this.updateAppRoot({...this.authState});

      return loginResult;
   }


   // TODO
   async logout() {

      // Remove it from local storage.
      await LocalDataStorage.remove(StorageKey.authState);

      // Reset the AuthState.
      this.authState = new AuthState();

      // Provide the AppRoot with the updated AuthState.
      this.updateAppRoot({...this.authState});

      return;
   }


   // Save the current AuthState using the local data storage.
   async saveAuthState() {
      return await LocalDataStorage.set(StorageKey.authState, this.authState);
   }

   // Set the AppRoot's callback function to use when the AuthState is updated.
   async setAppRootCallback(callback_: IAuthStateCallback) {
      if (!callback_) { throw new Error("Invalid AppRoot callback in AuthService.setAppRootCallback"); }
      this.updateAppRoot = callback_;
      return;
   }
}

// Create a singleton instance of _AuthService.
export const AuthService = new _AuthService();
