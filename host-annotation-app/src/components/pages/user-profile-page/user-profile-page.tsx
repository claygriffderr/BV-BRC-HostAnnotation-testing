
import { Component, Element, Host, h } from '@stencil/core';
import { ControlType, HeaderControlType, LabelOrientation } from "../../../global/Types";
import { Settings } from "../../../global/Settings";

enum AttributeKey {
   email = "email",
   name = "name"
}


@Component({
  tag: 'user-profile-page',
  styleUrl: 'user-profile-page.css'
})
export class UserProfilePage {

   @Element() el: HTMLUserProfilePageElement;


   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle={Settings.appLongName} controlType={HeaderControlType.back}></authorized-header>
               <div class="centered-body">

                  <ion-card>
                     <ion-card-header>
                        <ion-card-title>Your profile</ion-card-title>
                     </ion-card-header>

                     <ion-card-content>

                        <labeled-control
                           attributeKey={AttributeKey.email}
                           controlType={ControlType.readOnly}
                           isRequired={false}
                           labelOrientation={LabelOrientation.top}
                           labelText={"Email"}
                        ></labeled-control>

                        <labeled-control
                           attributeKey={AttributeKey.name}
                           controlType={ControlType.readOnly}
                           isRequired={false}
                           labelOrientation={LabelOrientation.top}
                           labelText={"Name"}
                        ></labeled-control>

                     </ion-card-content>
                  </ion-card>
               </div>
            </div>
         </Host>
      );
   }

}
