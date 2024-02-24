
import { Component, Host, h, Prop } from '@stencil/core';
import { ISearchCallback, SearchPanelState } from "./Common";
import { LocalDataStorage } from "../../../services/LocalDataStorage";
import { PageKey } from "../../../global/Types";
import { Settings } from "../../../global/Settings";


@Component({
   tag: 'search-panel',
   styleUrl: 'search-panel.css'
})
export class SearchPanel {

   controlIdentifier: string = "SEARCH_PANEL";

   @Prop({ attribute: "pageKey", mutable: true, reflect: true })
   pageKey: PageKey = null;

   @Prop({ attribute: "placeholderText", mutable: true, reflect: true })
   placeholderText: string = "Enter search text (optional)";

   // The search button Element
   searchButtonEl: HTMLIonButtonElement;

   // The callback that performs the search by calling a web service.
   @Prop({ attribute: "searchCallback", mutable: true, reflect: true })
   searchCallback: ISearchCallback = null;

   // The search text Element
   searchTextEl: HTMLInputElement;

   // The search panel's state.
   state: SearchPanelState = null;

   // The unique identifier used when loading from or saving to local storage.
   storageKey: string = null;

   @Prop({ attribute: "useState", mutable: true, reflect: true })
   useState: boolean = true;



   async clear() {

      // Clear the text in the search text Element.
      this.searchTextEl.value = "";

      if (this.useState) {

         // Update the local state and save it to local storage.
         this.state.searchText = "";
         this.saveState();
      }

      // Re-enable the search button.
      this.searchButtonEl.disabled = false;
      return;
   }

   async componentDidLoad() {

      if (this.useState && !!this.state.searchText && this.state.searchText.length > 0) {

         // Pre-populate the search text using the persisted value.
         this.searchTextEl.value = this.state.searchText;
      }

      // If the user presses the enter key while the focus is on the search text, search.
      this.searchTextEl.addEventListener("keypress", async (event_: KeyboardEvent) => {
         if (event_.key === "Enter") {
             event_.preventDefault();
             event_.stopPropagation();
             await this.search();
         }
         return true;
     })
     
      return;
   }


   async componentWillLoad() {

      if (!this.pageKey) { throw new Error("Invalid page key attribute"); }

      // Create the storage key
      this.storageKey = `${Settings.appIdentifier}_${this.pageKey}_${this.controlIdentifier}`;

      if (this.useState) {

         // Look for an existing state persisted in local storage.
         this.state = await LocalDataStorage.get<SearchPanelState>(this.storageKey);
         if (!this.state) {

            // Create a new state and persist it in local storage.
            this.state = new SearchPanelState(this.storageKey);
            await this.saveState(); 
         } 
      }
      return;
   }

   // Persist the search panel's state in local storage.
   async saveState() {
      if (this.useState) { await LocalDataStorage.set(this.storageKey, this.state); }
      return;
   }


   // Search using the search text parameter or the value from the search text Element.
   async search(searchText_?: string) {

      if (!searchText_) { 

         // Look for text in the search text Element.
         searchText_ = this.searchTextEl.value;

         if (this.useState) {

            // Update the local state and save it to local storage.
            this.state.searchText = searchText_;
            this.saveState();
         }
      }

      if (!this.searchCallback) { throw new Error("Invalid search callback"); }

      // Disable the search button until the search is complete.
      this.searchButtonEl.disabled = true;

      // Call the search callback.
      await this.searchCallback(searchText_);

      // Re-enable the search button.
      this.searchButtonEl.disabled = false;
      return;
   }

   render() {
      return (
         <Host>
            <div class="search-controls">
               <input type="search" 
                  class="search-text" 
                  placeholder={this.placeholderText} 
                  ref={el_ => this.searchTextEl = el_}
                  spellcheck={false}
               />
               
               <ion-button 
                  class="search-button" 
                  color="primary" 
                  mode="ios" 
                  onClick={async () => this.search()} 
                  ref={el_ => this.searchButtonEl = el_}
                  size="small"
               >
                  <ion-icon name="search-outline" slot="start"></ion-icon> Search
               </ion-button>
               <ion-button 
                  class="clear-button"
                  color="medium"
                  mode="ios" 
                  onClick={async () => this.clear()} 
                  size="small"
               >Clear</ion-button>
               
            </div>
         </Host>
      );
   }

}
