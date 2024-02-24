
import { AuthService } from "../../../services/AuthService";
import { Component, Element, Host, h } from '@stencil/core';
import { Utils } from "../../../helpers/Utils";
import { Router } from "../../../helpers/Router";
import { AppRole, PageKey } from "../../../global/Types";
import { Settings } from "../../../global/Settings";


enum AttributeKey {
   email = "email-control",
   password = "password-control"
}


@Component({
   tag: 'login-page',
   styleUrl: 'login-page.css'
})
export class LoginPage {

   @Element() el: HTMLLoginPageElement;


   controlState: Map<string, boolean>;

   elements: {
      email: HTMLIonInputElement,
      password: HTMLIonInputElement
   }


   // C-tor
   constructor() {


      // Initialize the collection of element references.
      this.elements = {
         email: null,
         password: null
      }

      // Initialize the control state.
      this.controlState = new Map<string, boolean>();
      this.controlState.set(AttributeKey.email, false);
      this.controlState.set(AttributeKey.password, false);
   }


   async componentDidLoad() {

      this.elements.email = this.el.querySelector(`ion-input.${AttributeKey.email}`);
      if (!this.elements.email) { throw new Error("Invalid email Element"); }

      this.elements.password = this.el.querySelector(`ion-input.${AttributeKey.password}`);
      if (!this.elements.password) { throw new Error("Invalid password Element"); }

      /*
      this.elements.email.addEventListener('ionBlur', () => {
         
         this.markTouched(this.elements.email);

         let isValid = this.isEmailValid(this.elements.email.value as string);
         this.updateControlStatus(this.elements.email, isValid); 

         this.controlState[AttributeKey.email] = isValid;
      });

      this.elements.password.addEventListener("ionBlur", () => {
         
         this.markTouched(this.elements.password);

         let isValid = true;

         let password = this.elements.password.value as string;
         if (password) { password = password.trim(); }

         if (!password) {
            isValid = false;
            this.elements.password.setAttribute("error-text", "Please enter a valid password");
         }

         this.updateControlStatus(this.elements.password, isValid); 

         this.controlState[AttributeKey.password] = isValid;
      });
      */

      return;
   }

   
   isEmailValid(email_: string) {
      return (!Utils.isNullOrEmpty(email_) && email_.match(/^[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}/)) ? false : true;
   }


   async login() {

      let isFormValid = true;


      //if (!this.controlState[AttributeKey.email] || !this.controlState[AttributeKey.password]) { isFormValid = false; }

      if (!isFormValid) { console.error("form is invalid"); return; }

      // Get the email and password from the form controls.
      let email = this.elements.email.value as string;
      email = Utils.safeTrim(email);
      if (!email) {
         // TODO: update the input control's status
         isFormValid = false;
      }

      let password = this.elements.password.value as string;
      password = Utils.safeTrim(password);
      if (!password) {
         // TODO: update the input control's status
         isFormValid = false;
      }

      // Use the auth service to login.
      const loginResult = await AuthService.login(email, password);

      if (!loginResult || !loginResult.isAuthenticated) { 

         // The authentication failed.
         alert(loginResult.message);

         // Reset the email and password controls
         this.elements.email.value = "";
         this.elements.password.value = "";

         // TODO: update valid/invalid CSS? Form's isValid?
         return;
      }
      
      let nextPage = null;

      switch (loginResult.role) {

         case AppRole.curator:
            nextPage =`/${PageKey.home}`;
            break;

         case AppRole.administrator:
            nextPage = "/admin/home";
            break;

         default: throw new Error("Unrecognized application role")
      }

      // Navigate to the (role-specific) next page.
      return Router.push(nextPage);
   }

   markTouched(el_: HTMLIonInputElement) {
      el_.classList.add("ion-touched");
   }

   async resetPassword() {
      await Router.push(`/${PageKey.resetPassword}`);
      return;
   }

   updateControlStatus(el_: HTMLElement, isValid_: boolean) {
      if (isValid_) {
         el_.classList.add('ion-valid');
         el_.classList.remove('ion-invalid');
      } else {
         el_.classList.remove('ion-valid');
         el_.classList.add('ion-invalid');
      }
   }


   render() {
      return (
         <Host>
            <div class="centered-body">

               <ion-card>
                  <ion-card-header>
                     <ion-card-title>{Settings.appLongName}</ion-card-title>
                     <ion-card-subtitle>Please login to continue</ion-card-subtitle>
                  </ion-card-header>

                  <ion-card-content>
                     <ion-input
                        class="email-control"
                        error-text="Invalid email"
                        label="Email"
                        label-placement="floating"
                        placeholder="email@domain.com"
                        type="email"
                     />
                     <ion-input
                        class="password-control"
                        error-text="Invalid password"
                        label="Password"
                        label-placement="floating" 
                        type="password" 
                     />
                     <ion-button color="success" expand="block" onClick={async () => this.login()}>Login</ion-button>

                    
                     <div class="reset-password-link" onClick={async () => await this.resetPassword()}>Reset password</div>

                  </ion-card-content>
               </ion-card>

            </div>
         </Host>
      );
   }

}
