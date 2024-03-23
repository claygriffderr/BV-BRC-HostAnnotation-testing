
import { Component, Element, Host, h, State } from '@stencil/core';
import { CuratedWordsService } from '../../../services/CuratedWordsService';
import DataTable from 'datatables.net-dt';
import { CurationType, CurationTypeLookup, HeaderControlType, PageKey } from "../../../global/Types";
import { ICuratedWord } from "../../../models/ICuratedWord";
import { Utils }  from "../../../helpers/Utils";
//import { Router } from "../../../helpers/Router";
//import { Settings } from "../../../global/Settings";


@Component({
  tag: 'curated-words-page',
  styleUrl: 'curated-words-page.css'
})
export class CuratedWordsPage {

   dataTable: any;

   @Element() el: HTMLCuratedWordsPageElement;

   filterTypesEl: HTMLSelectElement;

   // When the page loads (before searching occurs) empty data is expected. After the search,
   // however, if there are no results we will display a "No results" message.
   isBeforeSearch: boolean = true;

   searchPanelEl: HTMLSearchPanelElement;

   @State() words: ICuratedWord[];

  
   // Add a new curated word.
   addWord() {
      alert("Not yet implemented")
      //Router.push(`/${PageKey.createCuratedWord}`, "forward")
   }


   async componentDidLoad() {
      await this.initializeDataTable();
      return;
   }

   async componentDidUpdate() {
      await this.initializeDataTable();
      return;
   }

   displayWords() {

      if (!Array.isArray(this.words) || this.words.length < 1) {
         const noDataText = this.isBeforeSearch ? "" : "No results";
         return <div class="no-data">{noDataText}</div>; 
      }

      let rows = [];

      this.words.forEach((word_: ICuratedWord) => {

         const typeLabel = CurationTypeLookup(word_.type);

         rows.push(<tr data-uid={word_.uid}>
            <td>{typeLabel}</td>
            <td>{word_.searchText}</td>
            <td>{word_.alternateText}</td>
         </tr>);
      })

      // Variables used when formatting the result count.
      const resultCount = this.words.length;
      const resultsText = this.words.length === 1 ? "result" : "results";

      return <div class="words-container">
         <div class="search-results-message">Your search returned <span class="search-results-count">{resultCount}</span> {resultsText}</div>
         <table class="words stripe cell-border">
            <thead>
               <tr>
                  <th>Type</th>
                  <th>Search for</th>
                  <th>Replace with</th>
               </tr>
            </thead>
            <tbody>{rows}</tbody>
         </table>
      </div>;
   }

   
   // Initialize the data table object.
   async initializeDataTable() {

      if (!Array.isArray(this.words) || this.words.length < 1) {
         if (!!this.dataTable) { 
            this.dataTable.destroy(); 
            this.dataTable = null;
         }

         return;
      }

      if (!this.dataTable) {

         // Initialize the data table object.
         this.dataTable = new DataTable("table.words", {
            dom: "ltip",
            lengthMenu: [20, 50, 100],
            order: [], // Important: If this isn't an empty array it will move the child rows to the end!
            pageLength: 50,
            searching: false,
            stripeClasses: []
         });
         
         const tableEl = this.el.querySelector("table.words");
         if (!tableEl) { throw new Error("Invalid table Element"); }

         tableEl.addEventListener("click", async (event_: MouseEvent) => {

            // Get the closest TR Element to the target Element.
            const trEl = (event_.target as HTMLElement).closest(`tr`);
            if (!trEl) { return; }
            
            const wordUID = trEl.getAttribute("data-uid");
            if (!wordUID) { return; }

            event_.preventDefault();
            event_.stopPropagation();

            return await this.viewCuratedWord(wordUID);
         })

      } else {
         
         // Redraw the data table.
         this.dataTable.draw();
      }

      return;
   }

   async search(searchText_: string) {

      // Since we're recreating the HTML table, we need to destroy the dataTable.
      // TODO: there's probably a way to use the DataTables API to allow the table to be
      // recreated without destroying the dataTable, but I haven't found it.
      if (!!this.dataTable) {
         this.dataTable.destroy();
         this.dataTable = null;
      }

      // Clear the word data so it can be replaced.
      this.words = null;

      // Get and trim the search text.
      searchText_ = Utils.safeTrim(searchText_);
      
      this.isBeforeSearch = false;

      // Look for a filter type selection.
      let type = !this.filterTypesEl ? null : this.filterTypesEl.value as CurationType;

      // Call the web service
      this.words = await CuratedWordsService.searchCuratedWords(searchText_, type);
      return;
   }

   // Navigate to the "edit curated word" page.
   async viewCuratedWord(uid_: string) {
      console.log(`TODO: view/edit word ${uid_}`)
      //return Router.push(`/${PageKey.editCuratedWord}?wordUID=${uid_}`, "forward");
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
                           <select class="filter-types" ref={el_ => this.filterTypesEl = el_}>
                              <option value="" selected>all types</option>
                              <option value={CurationType.alternate_spelling}>{CurationTypeLookup(CurationType.alternate_spelling)}</option>
                              <option value={CurationType.filtered_characters}>{CurationTypeLookup(CurationType.filtered_characters)}</option>
                              <option value={CurationType.stop_word}>{CurationTypeLookup(CurationType.stop_word)}</option>
                              <option value={CurationType.subspecies_qualifier}>{CurationTypeLookup(CurationType.subspecies_qualifier)}</option>
                              <option value={CurationType.synonym}>{CurationTypeLookup(CurationType.synonym)}</option>
                           </select>
                        </div>

                        <ion-button class="ripple-parent" color="success" mode="ios" size="small" onClick={async () => this.addWord()}>
                           <ion-icon slot="start" name="add-outline"></ion-icon> Add Curated Word
                           <ion-ripple-effect></ion-ripple-effect>
                        </ion-button>
                     </div>

                     <search-panel 
                        pageKey={PageKey.curatedWords}
                        ref={el_ => this.searchPanelEl = el_}
                        searchCallback={this.search.bind(this)}>
                     </search-panel>

                     {this.displayWords()}
                  </div>
               </main>
            </div>
         </Host>
      );
   }

}
