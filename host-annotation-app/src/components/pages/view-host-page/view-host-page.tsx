
import { Component, Element, Host, h } from '@stencil/core';
import { AnnotationService } from "../../../services/AnnotationService";
import { ControlType, HeaderControlType, LabelOrientation } from "../../../global/Types";
import { IAnnotatedHost } from "../../../models/IAnnotatedHost";
import { Utils } from "../../../helpers/Utils";


@Component({
   tag: 'view-host-page',
   styleUrl: 'view-host-page.css'
})
export class ViewHostPage {

   annotatedHost: IAnnotatedHost;

   @Element() el: HTMLViewHostPageElement;



   async componentWillLoad() {

      let strHostID = await Utils.getParam("hostID");
      if (!strHostID) { throw new Error("Invalid host ID parameter"); }

      const hostID = parseInt(strHostID);
      if (isNaN(hostID)) { throw new Error("Unable to convert host ID parameter to an integer"); }

      this.annotatedHost = await AnnotationService.getAnnotatedHost(hostID);
      console.log("this.annotatedHost = ", this.annotatedHost)

      return;
   }


   render() {

      const isAvian = !this.annotatedHost.isAvian ? "No" : "Yes";

      let score = !this.annotatedHost.score ? "Unknown" : this.annotatedHost.score.toFixed(2);

      // Combine status and status details.
      let statusText = !this.annotatedHost.status ? "Unknown" : this.annotatedHost.status;
      if (!!this.annotatedHost.statusDetails) { statusText += `: ${this.annotatedHost.statusDetails}`}

      // Format the synonyms
      let synonyms = !this.annotatedHost.synonyms ? "" : this.annotatedHost.synonyms.replace(/;/g, ", ");

      const taxonomyLink = Utils.CreateTaxonomyDbLink(this.annotatedHost.taxonomyDB, this.annotatedHost.taxonomyID);

      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle="Annotated Host" controlType={HeaderControlType.menu}></authorized-header>
               <main>
                  
                  <div class="data-table-panel">

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
               </main>
            </div>
         </Host>
      );
   }

}
