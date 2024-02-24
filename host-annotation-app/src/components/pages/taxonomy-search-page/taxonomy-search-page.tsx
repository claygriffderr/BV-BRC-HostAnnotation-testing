
import { Component, Element, Host, h } from '@stencil/core';
import { TaxonomyService } from '../../../services/TaxonomyService';
import DataTable from 'datatables.net-dt';
import { HeaderControlType, NcbiNameClassLookup, PageKey, TaxonomyDB, TaxonomyDbLookup } from "../../../global/Types";
import { ITaxonName } from "../../../models/ITaxonName";
//import { Router } from "../../../helpers/Router";
//import { Settings } from "../../../global/Settings";


@Component({
   tag: 'taxonomy-search-page',
   styleUrl: 'taxonomy-search-page.css'
})
export class TaxonomySearchPage {

   dataTable;

   @Element() el: HTMLTaxonomySearchPageElement;

   filterTypesEl: HTMLSelectElement;

   // The "no data available" Element.
   noDataEl: HTMLElement;

   // The tbody Element of the taxa table.
   tableBodyEl: HTMLElement;

   tableContainerEl: HTMLTableElement;

   taxa: ITaxonName[];


   async componentDidLoad() {

      this.filterTypesEl = this.el.querySelector(".filter-types");
      if (!this.filterTypesEl) { console.error("Invalid filter types Element"); }

      this.noDataEl = this.el.querySelector(".no-data");
      if (!this.noDataEl) { console.error("Invalid no-data Element"); }

      this.tableBodyEl = this.el.querySelector("table.taxa tbody");
      if (!this.tableBodyEl) { console.error("Invalid tbody Element"); }

      this.tableContainerEl = this.el.querySelector(".table-container");
      if (!this.tableContainerEl) { console.error("Invalid table container Element"); }


      this.tableBodyEl.addEventListener("click", async (event_: MouseEvent) => {

         // Get the closest TR Element to the target Element.
         const trEl = (event_.target as HTMLElement).closest(`tr`);
         if (!trEl) { return; }
         
         const taxonIdentifier = trEl.getAttribute("data-taxdbid");
         if (!taxonIdentifier) { return; }

         event_.preventDefault();
         event_.stopPropagation();

         await this.viewTaxon(taxonIdentifier);
      })

      
      this.tableContainerEl.setAttribute("data-is-visible", "false");
      
      return;
   }

   displayTable() {

      if (!Array.isArray(this.taxa) || this.taxa.length < 1) {
         // Display the "no data available" panel. 
         this.tableContainerEl.setAttribute("data-is-visible", "false");
         this.noDataEl.setAttribute("data-is-visible", "true");
         return;
      }

      // Display the taxa table.
      this.tableContainerEl.setAttribute("data-is-visible", "true");
      this.noDataEl.setAttribute("data-is-visible", "false");

      if (this.dataTable != null) { this.dataTable.clear(); }

      this.taxa.forEach((taxon_: ITaxonName) => {

         const invalid = !taxon_.isValid ? "invalid" : "";
         const ncbiNameClass = NcbiNameClassLookup(taxon_.nameClass);
         const taxonomyDB = TaxonomyDbLookup(taxon_.taxonomyDB);

         const taxonIdentifier = `${taxonomyDB}:${taxon_.taxonomyID}`; 

         const tr = document.createElement("tr");
         tr.setAttribute("data-taxon-identifier", taxonIdentifier);

         const nameClassColumn = document.createElement("td");
         nameClassColumn.innerHTML = ncbiNameClass;
         tr.appendChild(nameClassColumn);

         const nameColumn = document.createElement("td");
         nameColumn.innerHTML = taxon_.name;
         tr.appendChild(nameColumn);

         const taxDbIdColumn = document.createElement("td");
         taxDbIdColumn.innerHTML = taxonIdentifier;
         tr.appendChild(taxDbIdColumn);

         const isValidColumn = document.createElement("td");
         isValidColumn.innerHTML = invalid;
         tr.appendChild(isValidColumn);

         if (this.dataTable != null) {
            this.dataTable.row.add(tr);
         } else {
            this.tableBodyEl.appendChild(tr);
         }
      })

      if (this.dataTable == null) {

         // Initialize the data table.
         this.dataTable = new DataTable("table.taxa", {
            dom: "ltip",
            lengthMenu: [20, 50, 100],
            order: [], // Important: If this isn't an empty array it will move the child rows to the end!
            pageLength: 50,
            searching: false,
            stripeClasses: []
         });   

      } else {
         // Redraw the data table.
         this.dataTable.draw();
      }
      
      return;
   }

   
   async search(searchText_: string) {

      let taxonomyDB = null;

      // Look for a filter type selection.
      if (!!this.filterTypesEl) { taxonomyDB = this.filterTypesEl.value; }

      // Call the web service
      this.taxa = await TaxonomyService.searchTaxonomyDBs(searchText_, taxonomyDB);

      this.displayTable();

      return;
   }


   // Navigate to the "view taxon" page.
   async viewTaxon(taxDbId_: string) {
      console.log(`TODO: view taxon ${taxDbId_}`)
      //return Router.push(`/${PageKey.editCuratedWord}?wordUID=${uid_}`, "forward");
      return;
   }


   
   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle="Search Taxonomy Databases" controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  
                  <div class="data-table-panel">

                     <div class="top-controls">

                        <div class="filter-panel">
                           <label>Display results from</label>&nbsp;
                           <select class="filter-types">
                              <option value="" selected>all databases</option>
                              <option value={TaxonomyDB.ebird}>eBird</option>
                              <option value={TaxonomyDB.itis}>ITIS</option>
                              <option value={TaxonomyDB.ncbi}>NCBI Taxonomy</option>
                              <option value={TaxonomyDB.bv_brc}>BV-BRC</option>
                           </select>
                        </div>
                     </div>

                     <search-panel pageKey={PageKey.taxonomySearch} searchCallback={this.search.bind(this)}></search-panel>

                     <div class="no-data" data-is-visible="false">No results</div>

                     <div class="table-container" data-is-visible="false">
                        <table class="taxa stripe cell-border">
                           <thead>
                              <tr>
                                 <th>Name class</th>
                                 <th>Name</th>
                                 <th>Taxonomy DB:ID</th>
                                 <th>Invalid?</th>
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
