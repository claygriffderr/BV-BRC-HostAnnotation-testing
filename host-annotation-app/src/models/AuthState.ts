
import { AppRole, IAuthState } from "../global/Types";


export class AuthState implements IAuthState {

   // The user's application role.
   appRole: AppRole;

   // The authentication/authorization token used by web services.
   authToken: string;

   // Has the user been authenticated?
   isAuthenticated: boolean;


   // C-tor
   constructor(appRole_?: AppRole, authToken_?: string, isAuthenticated_?: boolean) {

      this.appRole = !appRole_ ? AppRole.unknown : appRole_;
      this.authToken = authToken_ || null;
      this.isAuthenticated = (isAuthenticated_ == null || typeof(isAuthenticated_) == "undefined") ? false : isAuthenticated_;
   }

}