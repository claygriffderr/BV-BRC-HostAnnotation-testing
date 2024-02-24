
import { Component, Element, Host, h } from '@stencil/core';
import { AnnotationService } from "../../../services/AnnotationService";
import DataTable from 'datatables.net-dt';
import { HeaderControlType, HostTokenTypeLookup, NcbiNameClass, NcbiNameClassLookup,
   TaxonMatchTypeLookup, TaxonomyDbLookup } from "../../../global/Types";
import { IHostTaxonMatch } from "../../../models/IHostTaxonMatch";
import { Utils } from "../../../helpers/Utils";


@Component({
   tag: 'host-taxa-matches-page',
   styleUrl: 'host-taxa-matches-page.css'
})
export class HostTaxaMatchesPage {

   dataTable;

   @Element() el: HTMLHostTaxaMatchesPageElement;

   matches: IHostTaxonMatch[];

   // The "no data available" Element.
   noDataEl: HTMLElement;

   // The tbody Element of the taxa table.
   tableBodyEl: HTMLElement;

   tableContainerEl: HTMLElement;



   async componentWillLoad() {

      // A host_id parameter should've been provided.
      let strHostID = await Utils.getParam("host_id");
      if (!strHostID) { throw new Error("Invalid host ID parameter (empty)"); }
      
      const hostID = parseInt(strHostID);
      if (isNaN(hostID)) { throw new Error("Unable to convert parameter to host ID"); }

      this.matches = await AnnotationService.getHostTaxaMatches(hostID);
      console.log("matches = ", this.matches)

      return;
   }


   displayTable() {

      if (!Array.isArray(this.matches) || this.matches.length < 1) {
         // Display the "no data available" panel. 
         this.tableContainerEl.setAttribute("data-is-visible", "false");
         this.noDataEl.setAttribute("data-is-visible", "true");
         return;
      }

      // Display the matches table.
      this.tableContainerEl.setAttribute("data-is-visible", "true");
      this.noDataEl.setAttribute("data-is-visible", "false");

      if (this.dataTable != null) { this.dataTable.clear(); }

      this.matches.forEach((match_: IHostTaxonMatch) => {

         const invalid = !match_.taxonNameIsValid ? "invalid" : "";
         const matchType = TaxonMatchTypeLookup(match_.matchType);
         const nameClass = !match_.customNameClass ? match_.nameClass : match_.customNameClass;
         const nameClassLabel = NcbiNameClassLookup(nameClass as NcbiNameClass);
         
         const rankName = !match_.customRankName ? match_.rankName : match_.customRankName;
         const taxonName = !match_.customName ? match_.taxonName : match_.customName;
         const taxonomyDB = TaxonomyDbLookup(match_.taxonomyDB);

         const taxonIdentifier = `${taxonomyDB}:${match_.taxonomyID}`; 
         const tokenType = HostTokenTypeLookup(match_.tokenType);

         // Create the row (TR) Element.
         const tr = document.createElement("tr");
         //tr.setAttribute("data-match-identifier", taxonIdentifier);

         const variationColumn = document.createElement("td");
         variationColumn.innerHTML = tokenType;
         tr.appendChild(variationColumn);

         const tokenColumn = document.createElement("td");
         tokenColumn.innerHTML = match_.hostToken;
         tr.appendChild(tokenColumn);

         const matchTypeColumn = document.createElement("td");
         matchTypeColumn.innerHTML = matchType;
         tr.appendChild(matchTypeColumn);

         const taxDbIdColumn = document.createElement("td");
         taxDbIdColumn.innerHTML = taxonIdentifier;
         tr.appendChild(taxDbIdColumn);

         const nameClassColumn = document.createElement("td");
         nameClassColumn.innerHTML = nameClassLabel;
         tr.appendChild(nameClassColumn);

         const nameColumn = document.createElement("td");
         nameColumn.innerHTML = taxonName;
         tr.appendChild(nameColumn);

         const rankColumn = document.createElement("td");
         rankColumn.innerHTML = rankName;
         tr.appendChild(rankColumn);

         const invalidColumn = document.createElement("td");
         invalidColumn.innerHTML = invalid;
         tr.appendChild(invalidColumn);

         if (this.dataTable != null) {
            this.dataTable.row.add(tr);
         } else {
            this.tableBodyEl.appendChild(tr);
         }
      })

      if (this.dataTable == null) {

         // Initialize the data table.
         this.dataTable = new DataTable("table.matches", {
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

   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle="Host Taxonomy Matches" controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  
                  <div class="data-table-panel">

                     <div class="no-data" data-is-visible="false" ref={el_ => this.noDataEl = el_}>No results</div>

                     <div class="table-container" data-is-visible="false" ref={el_ => this.tableContainerEl = el_}>
                        <table class="matches stripe cell-border">
                           <thead>
                              <tr>
                                 <th>Variation</th>
                                 <th>Token</th>
                                 <th>Match type</th>

                                 <th>Taxonomy DB:ID</th>
                                 <th>Name class</th>
                                 <th>Name</th>
                                 <th>Rank</th>
                                 <th>Invalid?</th>
                              </tr>
                           </thead>
                           <tbody ref={el_ => this.tableBodyEl = el_}></tbody>
                        </table>
                     </div>

                  </div>
               </main>
            </div>
         </Host>
      );
   }

}
