
import { Component, Element, Host, h } from '@stencil/core';
import { HeaderControlType } from "../../../global/Types";
import { Settings } from "../../../global/Settings";


@Component({
   tag: 'home-page',
   styleUrl: 'home-page.css'
})
export class HomePage {

   @Element() el: HTMLHomePageElement;

   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle={Settings.appLongName} controlType={HeaderControlType.menu}></authorized-header>
               <main>


                  
               </main>
            </div>
         </Host>
      );
   }

}
