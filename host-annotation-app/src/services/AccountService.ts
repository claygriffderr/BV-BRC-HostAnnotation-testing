
import { IApiResponse } from "../models/IApiResponse";
import { IResetPasswordResult } from "../models/IResetPasswordResult";
import { WebService } from "./WebService";
import { WebServiceKey } from "../global/Types";


export class _AccountService {


   async resetPassword(password_: string, token_: string): Promise<IResetPasswordResult> {

      const data = {
         password: password_,
         token: token_
      }

      const response = await WebService.postJSON<IApiResponse<IResetPasswordResult>>(WebServiceKey.resetPassword, data);
      if (!response) { return null; }

      console.log("response = ", response)
      console.log("response.data = ", response.data)

      return response.data as IResetPasswordResult;
      /*
      if (response.statusCode !== "OK") { 

         console.log("response status code != ok")

         const result = response.data as IResetPasswordResult;
         
         await AlertBuilder.displayError(result.message || "An unknown error occurred");
         return null;
      }

      AlertBuilder.displaySuccess("Your password has been successfully updated", "Success", async () => {
         alert("TODO: navigate back to the login page")
      })
      
      return;*/
   }



}

// Create a singleton instance of _AccountService.
export const AccountService = new _AccountService();
