
import { Component, Element, Host, h } from '@stencil/core';
import { CuratedWordsService } from '../../../services/CuratedWordsService';
import DataTable from 'datatables.net-dt';
import { CurationType, HeaderControlType, PageKey } from "../../../global/Types";
import { ICuratedWord } from "../../../models/ICuratedWord";
//import { Router } from "../../../helpers/Router";
//import { Settings } from "../../../global/Settings";


@Component({
  tag: 'curated-words-page',
  styleUrl: 'curated-words-page.css'
})
export class CuratedWordsPage {

   dataTable;

   @Element() el: HTMLCuratedWordsPageElement;

   filterTypesEl: HTMLSelectElement;

   // The "no data available" Element.
   noDataEl: HTMLElement;

   // The tbody Element of the words table.
   tableBodyEl: HTMLElement;

   tableContainerEl: HTMLTableElement;

   words: ICuratedWord[];

   

   


   addWord() {
      alert("Not yet implemented")
      //Router.push(`/${PageKey.createCuratedWord}`, "forward")
   }

   async componentDidLoad() {

      this.filterTypesEl = this.el.querySelector(".filter-types");
      if (!this.filterTypesEl) { console.error("Invalid filter types Element"); }

      this.noDataEl = this.el.querySelector(".no-data");
      if (!this.noDataEl) { console.error("Invalid no-data Element"); }

      this.tableBodyEl = this.el.querySelector("table.words tbody");
      if (!this.tableBodyEl) { console.error("Invalid tbody Element"); }

      this.tableContainerEl = this.el.querySelector(".table-container");
      if (!this.tableContainerEl) { console.error("Invalid table container Element"); }


      this.tableBodyEl.addEventListener("click", async (event_: MouseEvent) => {

         // Get the closest TR Element to the target Element.
         const trEl = (event_.target as HTMLElement).closest(`tr`);
         if (!trEl) { return; }
         
         const wordUID = trEl.getAttribute("data-uid");
         if (!wordUID) { return; }

         event_.preventDefault();
         event_.stopPropagation();

         await this.editWord(wordUID);
      })

      
      this.tableContainerEl.setAttribute("data-is-visible", "false");
      
      return;
   }

   displayTable() {

      if (!Array.isArray(this.words) || this.words.length < 1) {
         // Display the "no data available" panel. 
         this.tableContainerEl.setAttribute("data-is-visible", "false");
         this.noDataEl.setAttribute("data-is-visible", "true");
         return;
      }

      // Display the words table.
      this.tableContainerEl.setAttribute("data-is-visible", "true");
      this.noDataEl.setAttribute("data-is-visible", "false");

      if (this.dataTable != null) { this.dataTable.clear(); }

      // Clear the tbody of existing rows.
      //this.tableBodyEl.textContent = "";

      this.words.forEach((word_: ICuratedWord) => {

         const type = word_.type.replace("_", " ");

         const tr = document.createElement("tr");
         tr.setAttribute("data-uid", word_.uid);

         const typeColumn = document.createElement("td");
         typeColumn.innerHTML = type;
         tr.appendChild(typeColumn);

         const searchColumn = document.createElement("td");
         searchColumn.innerHTML = word_.searchText;
         tr.appendChild(searchColumn);

         const replaceColumn = document.createElement("td");
         replaceColumn.innerHTML = word_.alternateText;
         tr.appendChild(replaceColumn);

         if (this.dataTable != null) {
            this.dataTable.row.add(tr);
         } else {
            this.tableBodyEl.appendChild(tr);
         }
      })

      if (this.dataTable == null) {

         // Initialize the data table.
         this.dataTable = new DataTable("table.words", {
            dom: "ltip",
            order: [], // Important: If this isn't an empty array it will move the child rows to the end!
            searching: false,
            stripeClasses: []
         });   

      } else {
         // Redraw the data table.
         this.dataTable.draw();
      }
      
      return;
   }

   // Navigate to the "edit curated word" page.
   async editWord(uid_: string) {
      console.log(`TODO: edit word ${uid_}`)
      //return Router.push(`/${PageKey.editCuratedWord}?wordUID=${uid_}`, "forward");
   }


   async search(searchText_: string) {

      console.log(`in curated words search with text ${searchText_}`)

      let type = null;

      // Look for a filter type selection.
      if (!!this.filterTypesEl) { type = this.filterTypesEl.value; }

      // TODO: get search text.


      this.words = await CuratedWordsService.searchCuratedWords(searchText_, type);

      this.displayTable();

      return;
   }


   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle="Curated words" controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  
                  <div class="data-table-panel">

                     <div class="top-controls">

                        <div class="filter-panel">
                           <label>Display</label>&nbsp;
                           <select class="filter-types">
                              <option value="" selected>all types</option>
                              <option value={CurationType.alternate_spelling}>alternate spellings</option>
                              <option value={CurationType.filtered_characters}>filtered characters</option>
                              <option value={CurationType.stop_word}>stop words</option>
                              <option value={CurationType.subspecies_qualifier}>subspecies qualifiers</option>
                              <option value={CurationType.synonym}>synonynms</option>
                           </select>
                        </div>

                        <ion-button class="ripple-parent" color="success" mode="ios" size="small" onClick={async () => this.addWord()}>
                           <ion-icon slot="start" name="add-outline"></ion-icon> Add Curated Word
                           <ion-ripple-effect></ion-ripple-effect>
                        </ion-button>
                     </div>

                     <search-panel pageKey={PageKey.curatedWords} searchCallback={this.search.bind(this)}></search-panel>

                     <div class="no-data" data-is-visible="false">No results</div>

                     <div class="table-container" data-is-visible="false">
                        <table class="words stripe cell-border">
                           <thead>
                              <tr>
                                 <th>Type</th>
                                 <th>Search for</th>
                                 <th>Replace with</th>
                              </tr>
                           </thead>
                           <tbody></tbody>
                        </table>
                     </div>

                  </div>
               </main>
            </div>
         </Host>
      );
   }

}
