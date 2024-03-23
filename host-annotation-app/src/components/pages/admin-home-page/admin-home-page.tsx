
import { Component, Element, Host, h } from '@stencil/core';
import { HeaderControlType, PageKey } from "../../../global/Types";
import { Settings } from "../../../global/Settings";
import { Router } from "../../../helpers/Router";


@Component({
   tag: 'admin-home-page',
   styleUrl: 'admin-home-page.css'
})
export class AdminHomePage {

   @Element() el: HTMLAdminHomePageElement;


   async navigate(pageKey_: PageKey) {
      Router.push(`/${pageKey_}`);
      return;
   }

   
   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle={"Admin Home"} controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  <div class="centered-body">
                     <ion-card>
                        <ion-card-header>
                           <ion-card-title>Welcome to the {Settings.appLongName} app!</ion-card-title>
                           <ion-card-subtitle>The Administrator Portal</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                           <div class="feature-row" onClick={async () => await this.navigate(PageKey.createPerson)}>Create a person</div>
                        </ion-card-content>
                     </ion-card>
                     </div>
               </main>
            </div>
         </Host>
      );
   }

}