
import { Component, Element, Host, h, State } from '@stencil/core';
import { AnnotationService } from '../../../services/AnnotationService';
import DataTable from 'datatables.net-dt';
import { HeaderControlType, PageKey } from "../../../global/Types";
import { IAnnotatedHost } from "../../../models/IAnnotatedHost";
import { Router } from "../../../helpers/Router";
import { Utils } from "../../../helpers/Utils";


@Component({
   tag: 'hosts-page',
   styleUrl: 'hosts-page.css'
})
export class HostsPage {

   dataTable: any;

   @Element() el: HTMLHostsPageElement;

   @State() hosts: IAnnotatedHost[];

   // When the page loads (before searching occurs) empty data is expected. After the search,
   // however, if there are no results we will display a "No results" message.
   isBeforeSearch: boolean = true;

   searchPanelEl: HTMLSearchPanelElement;


   
   async componentDidLoad() {
      await this.initializeDataTable();
      return;
   }

   async componentDidUpdate() {
      await this.initializeDataTable();
      return;
   }

   displayHosts() {

      if (!Array.isArray(this.hosts) || this.hosts.length < 1) {
         const noDataText = this.isBeforeSearch ? "" : "No results";
         return <div class="no-data">{noDataText}</div>; 
      }

      let rows = [];

      this.hosts.forEach((host_: IAnnotatedHost) => {

         const status = !host_.status ? "Unknown" : host_.status;

         rows.push(<tr data-host-id={host_.hostID}>
            <td>{host_.hostText}</td>
            <td>{host_.scientificName}</td>
            <td>{status}</td>
         </tr>);
      })

      const hostCount = this.hosts.length === 0 ? "1 result" : `${this.hosts.length} results`;

      return <div class="hosts-container">
         <div class="data-table-result-count">Your search returned {hostCount}</div>
         <table class="hosts stripe cell-border">
            <thead>
               <tr>
                  <th>Host text</th>
                  <th>Scientific name</th>
                  <th>Status</th>
               </tr>
            </thead>
            <tbody>{rows}</tbody>
         </table>
      </div>;
   }


   // Initialize the data table object.
   async initializeDataTable() {

      if (Array.isArray(this.hosts) && this.hosts.length > 0) {

         if (!this.dataTable) {
            this.dataTable = new DataTable("table.hosts", {
               dom: "ltip",
               lengthMenu: [20, 50, 100],
               order: [], // Important: If this isn't an empty array it will move the child rows to the end!
               pageLength: 50,
               searching: false,
               stripeClasses: []
            });
            
            const tableEl = this.el.querySelector("table.hosts");
            if (!tableEl) { throw new Error("Invalid table Element"); }

            tableEl.addEventListener("click", async (event_: MouseEvent) => {

               // Get the closest TR Element to the target Element.
               const trEl = (event_.target as HTMLElement).closest(`tr`);
               if (!trEl) { return; }
               
               const hostID = trEl.getAttribute("data-host-id");
               if (!hostID) { return; }

               event_.preventDefault();
               event_.stopPropagation();

               return await this.viewHost(hostID);
           })

         } else {
            this.dataTable.draw();
         }
      }

      return;
   }


   async search(searchText_: string) {

      searchText_ = Utils.safeTrim(searchText_);
      if (!searchText_ || searchText_.length < 3) { alert("Please enter at least 3 characters"); return; }

      this.isBeforeSearch = false;

      // Call the web service
      this.hosts = await AnnotationService.searchAnnotatedHosts(searchText_);
      return;
   }


   // Navigate to the viewHost page.
   async viewHost(hostID_: string) {
      return Router.push(`/${PageKey.viewHost}?hostID=${hostID_}`);
   }   
   
   
   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle="Hosts" controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  
                  <div class="data-table-panel">

                     <search-panel 
                        pageKey={PageKey.hosts} 
                        ref={el_ => this.searchPanelEl = el_}
                        searchCallback={this.search.bind(this)}
                     ></search-panel>

                     {this.displayHosts()}

                  </div>
               </main>
            </div>
         </Host>
      );
   }

}
