
import { Component, Element, Host, h } from '@stencil/core';
import { HeaderControlType, PageKey } from "../../../global/Types";
import { Settings } from "../../../global/Settings";
import { Router } from "../../../helpers/Router";

@Component({
   tag: 'home-page',
   styleUrl: 'home-page.css'
})
export class HomePage {

   @Element() el: HTMLHomePageElement;


   async navigate(pageKey_: PageKey) {
      Router.push(`/${pageKey_}`);
      return;
   }


   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle={"Home"} controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  <div class="centered-body">
                     <ion-card>
                        <ion-card-header>
                           <ion-card-title>Welcome to the {Settings.appLongName} app!</ion-card-title>
                        </ion-card-header>

                        <ion-card-content>
                           <div class="feature-row" onClick={async () => await this.navigate(PageKey.annotateHost)}>Annotate a host</div>
                           <div class="feature-row" onClick={async () => await this.navigate(PageKey.curatedWords)}>Search curated words</div>
                           <div class="feature-row" onClick={async () => await this.navigate(PageKey.hosts)}>Search hosts</div>
                           <div class="feature-row" onClick={async () => await this.navigate(PageKey.taxonomySearch)}>Search taxonomy databases</div>
                        </ion-card-content>
                     </ion-card>
                     </div>
               </main>
            </div>
         </Host>
      );
   }

}
