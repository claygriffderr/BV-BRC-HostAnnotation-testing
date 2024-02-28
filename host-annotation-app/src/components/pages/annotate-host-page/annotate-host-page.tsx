
import { Component, Element, Host, h, State } from '@stencil/core';
import { AnnotationService } from "../../../services/AnnotationService";
import { ControlType, HeaderControlType, LabelOrientation } from "../../../global/Types";
import { IAnnotatedHost } from "../../../models/IAnnotatedHost";
import { Utils } from "../../../helpers/Utils";


@Component({
   tag: 'annotate-host-page',
   styleUrl: 'annotate-host-page.css'
})
export class AnnotateHostPage {

   annotateButtonEl: HTMLIonButtonElement;

   @State() annotatedHost: IAnnotatedHost;

   @Element() el: HTMLAnnotateHostPageElement;

   hostEl: HTMLInputElement;

   placeholderText = "Enter a host name";


   async annotate() {

      if (!this.hostEl) { throw new Error("Invalid host Element"); }

      let hostText = Utils.safeTrim(this.hostEl.value);
      if (!hostText) { alert("Please enter a valid host name"); return; }

      console.log(`you entered ${hostText}`)

      this.annotatedHost = await AnnotationService.annotateHostText(hostText);
      console.log("this.annotatedHost = ", this.annotatedHost)

      return;
   }
   

   displayAnnotatedHost() {

      if (!this.annotatedHost) { return <div></div>; }

      const isAvian = !this.annotatedHost.isAvian ? "No" : "Yes";

      let score = !this.annotatedHost.score ? "Unknown" : this.annotatedHost.score.toFixed(2);

      // Combine status and status details.
      let statusText = !this.annotatedHost.status ? "Unknown" : this.annotatedHost.status;
      if (!!this.annotatedHost.statusDetails) { statusText += `: ${this.annotatedHost.statusDetails}`}

      // Format the synonyms
      let synonyms = !this.annotatedHost.synonyms ? "" : this.annotatedHost.synonyms.replace(/;/g, ", ");

      const taxonomyLink = Utils.CreateTaxonomyDbLink(this.annotatedHost.taxonomyDB, this.annotatedHost.taxonomyID);

      return <div class="host-controls">

         <ion-card>
            <ion-card-header>
               <ion-card-title>Annotation results</ion-card-title>
            </ion-card-header>

            <ion-card-content>

               <labeled-control
                  attributeKey="status"
                  controlType={ControlType.readOnly} 
                  initialValue={statusText}
                  labelOrientation={LabelOrientation.left}
                  labelText="Status"
               ></labeled-control>

               <labeled-control
                  controlType={ControlType.readOnly} 
                  initialValue={score}
                  labelOrientation={LabelOrientation.left}
                  labelText="Score"
               ></labeled-control>

               <table class="annotated-host-table">
                  <tr>
                     <td class="col-1"><labeled-control
                        controlType={ControlType.text} 
                        initialValue={this.annotatedHost.scientificName || ""}
                        labelOrientation={LabelOrientation.top}
                        labelText="Scientific name"
                     ></labeled-control></td>

                     <td><labeled-control
                        controlType={ControlType.text} 
                        initialValue={this.annotatedHost.commonName || ""} 
                        labelOrientation={LabelOrientation.top}
                        labelText="Common name"
                     ></labeled-control></td>
                  </tr>
                  <tr>
                     <td colSpan={2}><labeled-control
                        controlType={ControlType.text} 
                        initialValue={synonyms}
                        labelOrientation={LabelOrientation.top}
                        labelText="Synonyms"
                     ></labeled-control></td>
                  </tr>
                  <tr>
                     <td class="col-1"><labeled-control
                        controlType={ControlType.text} 
                        initialValue={this.annotatedHost.rankName || ""}
                        labelOrientation={LabelOrientation.top}
                        labelText="Rank"
                     ></labeled-control></td>

                     <td><labeled-control
                        controlType={ControlType.text} 
                        initialValue={isAvian}
                        labelOrientation={LabelOrientation.top}
                        labelText="Avian?"
                     ></labeled-control></td>
                  </tr>
                  <tr>
                     <td class="col-1"><labeled-control
                        controlType={ControlType.text} 
                        initialValue={this.annotatedHost.classScientificName || ""}
                        labelOrientation={LabelOrientation.top}
                        labelText="Class scientific name"
                     ></labeled-control></td>

                     <td><labeled-control
                        controlType={ControlType.text} 
                        initialValue={this.annotatedHost.classCommonName || ""}
                        labelOrientation={LabelOrientation.top}
                        labelText="Class common name"
                     ></labeled-control></td>
                  </tr>
               </table>
               <div innerHTML={taxonomyLink}></div>
            </ion-card-content>
         </ion-card>
      </div>
   }

   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle="Host Annotation" controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  
                  <div class="data-table-panel">

                     <div class="search-controls">
                        <input type="search" spellcheck={false} class="host-text" placeholder={this.placeholderText} ref={el_ => this.hostEl = el_} />
                        <ion-button 
                           class="search-button" 
                           color="primary" 
                           mode="ios" 
                           onClick={async () => await this.annotate()} 
                           ref={el_ => this.annotateButtonEl = el_}
                           size="small"
                        >
                           Get annotation
                        </ion-button>
                     </div>
                     
                     {this.displayAnnotatedHost()}

                  </div>
               </main>
            </div>
         </Host>
      );
   }

}
