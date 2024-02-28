
import { AccountService } from "../../../services/AccountService";
import { AlertBuilder } from "../../../helpers/AlertBuilder";
import { Component, Element, Host, h } from '@stencil/core';
import { IResetPasswordResult } from "../../../models/IResetPasswordResult";
import { PageKey } from "../../../global/Types";
import { Router } from "../../../helpers/Router";
import { Settings } from "../../../global/Settings";
import { Utils } from "../../../helpers/Utils";


@Component({
  tag: 'reset-password-page',
  styleUrl: 'reset-password-page.css'
})
export class ResetPasswordPage {


   @Element() el: HTMLResetPasswordPageElement;

   passwordEl: HTMLIonInputElement;

   token: string;


   async componentWillLoad() {

      this.token = await Utils.getParam("token");
      this.token = Utils.safeTrim(this.token);
      if (!this.token) { throw new Error("Invalid token parameter"); }


      return;
   }

   async resetPassword() {

      if (!this.token) { throw new Error("Invalid token"); }

      if (!this.passwordEl) { throw new Error("Invalid password Element"); }

      let password = this.passwordEl.value as string;
      if (!password) { return await AlertBuilder.displayError("Please enter a valid password"); }

      const result: IResetPasswordResult = await AccountService.resetPassword(password, this.token);

      if (result.result) {
         AlertBuilder.displaySuccess("Your password has been successfully updated", "Success", async () => {
            await Router.push(`/${PageKey.login}`, "root");
         })
      } else {
         await AlertBuilder.displayError(result.message || "An unknown error occurred");
      }
      
      return;
   }


   render() {
      return (
         <Host>
            <div class="centered-body">

               <ion-card>
                  <ion-card-header>
                     <ion-card-title>{Settings.appLongName}</ion-card-title>
                     <ion-card-subtitle>Please enter your new password and click "submit"</ion-card-subtitle>
                  </ion-card-header>

                  <ion-card-content>
                     <ion-input
                        class="password-control"
                        error-text="Invalid password"
                        label="Password"
                        label-placement="floating"
                        ref={el_ => this.passwordEl = el_}
                        type="password"
                     />
                     <ion-button 
                        color="success" 
                        expand="block" 
                        onClick={async () => this.resetPassword()}
                     >Submit</ion-button>

                  </ion-card-content>
               </ion-card>

            </div>
         </Host>
      );
   }

}
