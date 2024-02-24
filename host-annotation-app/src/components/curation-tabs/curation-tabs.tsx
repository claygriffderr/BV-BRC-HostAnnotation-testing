
import { Component, h } from '@stencil/core';

@Component({
   tag: 'curation-tabs',
   styleUrl: 'curation-tabs.css'
})
export class CurationTabs {

   render() {
      return (
         <ion-tabs>

            <ion-tab tab="tab-home">
               <ion-nav></ion-nav>
            </ion-tab>

            <ion-tab tab="tab-hosts">
               <ion-nav></ion-nav>
            </ion-tab>

            <ion-tab tab="tab-curated-words">
               <ion-nav></ion-nav>
            </ion-tab>

            <ion-tab tab="tab-taxonomy-search">
               <ion-nav></ion-nav>
            </ion-tab>

            <ion-tab-bar slot="bottom">

               <ion-tab-button tab="tab-home">
                  <ion-icon name="home"></ion-icon>
                  <ion-label>Home</ion-label>
               </ion-tab-button>

               <ion-tab-button tab="tab-hosts">
                  <ion-icon name="bug-outline"></ion-icon>
                  <ion-label>Hosts</ion-label>
               </ion-tab-button>

               <ion-tab-button tab="tab-curated-words">
                  <ion-icon name="create-outline"></ion-icon>
                  <ion-label>Curated Words</ion-label>
               </ion-tab-button>

               <ion-tab-button tab="tab-taxonomy-search">
                  <ion-icon name="search-outline"></ion-icon>
                  <ion-label>Taxonomy Search</ion-label>
               </ion-tab-button>

            </ion-tab-bar>
         </ion-tabs>
      );
   }

}
