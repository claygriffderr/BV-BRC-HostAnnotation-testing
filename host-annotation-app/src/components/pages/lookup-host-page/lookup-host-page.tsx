
import { Component, Element, Host, h } from '@stencil/core';
//import { AnnotationService } from "../../../services/AnnotationService";
import { HeaderControlType } from "../../../global/Types";

@Component({
  tag: 'lookup-host-page',
  styleUrl: 'lookup-host-page.css'
})
export class LookupHostPage {


   @Element() el: HTMLHostsPageElement;

   placeholderText: "Please enter at least 3 characters of a hostname";

   async lookupHost() {

      const hostEl: HTMLInputElement = this.el.querySelector(".host-field");
      if (!hostEl) { throw new Error("Invalid host Element"); }

      if (!hostEl.value) { alert("Please enter a valid host name"); }
      const hostText = hostEl.value.trim();
      if (!hostText) { alert("Please enter a valid host name"); }

      console.log(`you entered ${hostText}`)

      // TODO!

      return;
   }


   render() {

      /*
<div class="search-controls">
                        <input type="search" class="host-text" placeholder={this.placeholderText} ref={el_ => this.searchTextEl = el_} />
                        <ion-button class="search-button" color="primary" mode="ios" onClick={async () => this.search()} ref={el_ => this.searchButtonEl = el_}>
                           <ion-icon slot="start" name="search-outline"></ion-icon> Search
                        </ion-button>
                     </div>

      */
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle="Lookup Host" controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  
                  <div class="data-table-panel">

                     
                     

                     <input class="host-field" type="text" />
                     <ion-button class="ripple-parent" color="success" mode="ios" size="small" onClick={async () => this.lookupHost()}>
                        <ion-icon slot="start" name="add-outline"></ion-icon> Annotate
                        <ion-ripple-effect></ion-ripple-effect>
                     </ion-button>
                     
                  </div>
               </main>
            </div>
         </Host>
      );
   }

}
