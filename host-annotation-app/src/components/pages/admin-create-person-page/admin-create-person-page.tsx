
import { AdminService } from '../../../services/AdminService';
import { Component, Host, h } from '@stencil/core';
import { AppRole, ControlType, GenericStatus, HeaderControlType, LabelOrientation } from "../../../global/Types";
import { IControlListOption } from "../../components/labeled-control/Common";
import { Settings } from "../../../global/Settings";
import { Utils } from "../../../helpers/Utils";


enum AttributeKey {
   email = "email",
   firstName = "firstName",
   lastName = "lastName",
   password = "password",
   role = "role"
}

@Component({
   tag: 'admin-create-person-page',
   styleUrl: 'admin-create-person-page.css'
})
export class AdminCreatePersonPage {


   controls: {
      email: HTMLLabeledControlElement,
      firstName: HTMLLabeledControlElement,
      lastName: HTMLLabeledControlElement,
      password: HTMLLabeledControlElement,
      role: HTMLLabeledControlElement
   }

   roleOptions: IControlListOption[];


   // C-tor
   constructor() {
      this.controls = {
         email: null,
         firstName: null,
         lastName: null,
         password: null,
         role: null
      }
   }


   async clearControls() {
      this.controls.email.clearValue();
      this.controls.firstName.clearValue();
      this.controls.lastName.clearValue();
      this.controls.password.clearValue();
      this.controls.role.clearValue();
      return;
   }

   async componentWillLoad() {

      // Populate list options for the role control.
      this.roleOptions = [
         { isSelected: true, label: "Viewer", value: AppRole.viewer },
         { label: "Curator", value: AppRole.curator }
      ];

      return;
   }


   async createPerson() {

      let isValid = true;

      let email = await this.controls.email.getValue();
      email = Utils.safeTrim(email);
      if (Utils.isNullOrEmpty(email)) {
         this.controls.email.status = GenericStatus.error;
         this.controls.email.statusMessage = "Please enter a valid email address";
         isValid = false;
      }

      let firstName = await this.controls.firstName.getValue();
      firstName = Utils.safeTrim(firstName);
      if (Utils.isNullOrEmpty(firstName)) {
         this.controls.firstName.status = GenericStatus.error;
         this.controls.firstName.statusMessage = "Please enter a valid first name";
         isValid = false;
      }

      let lastName = await this.controls.lastName.getValue();
      lastName = Utils.safeTrim(lastName);
      if (Utils.isNullOrEmpty(lastName)) {
         this.controls.lastName.status = GenericStatus.error;
         this.controls.lastName.statusMessage = "Please enter a valid last name";
         isValid = false;
      }

      // TODO
      const orgUID = null; 
      
      let password = await this.controls.password.getValue();

      let role = await this.controls.role.getValue();
      role = Utils.safeTrim(role);
      if (Utils.isNullOrEmpty(role)) {
         this.controls.role.status = GenericStatus.error;
         this.controls.role.statusMessage = "Please select a valid role";
         isValid = false;
      }

      // TODO?
      const status = null;


      if (isValid) {

         const success = await AdminService.createPerson(email, firstName, lastName, orgUID, password, role as AppRole, status);
         
         console.log("The result of createPerson = ", success)
      }

      return;
   }


   render() {
      return (
         <Host>
            <div class="page-container">
               <authorized-header pageTitle={Settings.appLongName} controlType={HeaderControlType.back}></authorized-header>
               <div class="centered-body">

                  <ion-card>
                     <ion-card-header>
                        <ion-card-title>Add a new user</ion-card-title>
                     </ion-card-header>

                     <ion-card-content>

                        <labeled-control
                           attributeKey={AttributeKey.email}
                           controlType={ControlType.text}
                           isRequired={true}
                           labelOrientation={LabelOrientation.top}
                           labelText={"Email"}
                           ref={el_ => this.controls.email = el_}
                           textPlaceholder="email@domain.com"
                        ></labeled-control>

                        <labeled-control
                           attributeKey={AttributeKey.firstName}
                           controlType={ControlType.text}
                           isRequired={true}
                           labelOrientation={LabelOrientation.top}
                           labelText={"First name"}
                           ref={el_ => this.controls.firstName = el_}
                        ></labeled-control>

                        <labeled-control
                           attributeKey={AttributeKey.lastName}
                           controlType={ControlType.text}
                           isRequired={true}
                           labelOrientation={LabelOrientation.top}
                           labelText={"Last name"}
                           ref={el_ => this.controls.lastName = el_}
                        ></labeled-control>

                        <labeled-control
                           attributeKey={AttributeKey.role}
                           controlType={ControlType.termList}
                           isRequired={true}
                           labelOrientation={LabelOrientation.top}
                           labelText={"Role"}
                           listOptions={this.roleOptions}
                           ref={el_ => this.controls.role = el_}
                        ></labeled-control>

                        <labeled-control
                           attributeKey={AttributeKey.password}
                           controlType={ControlType.text}
                           isRequired={false}
                           labelOrientation={LabelOrientation.top}
                           labelText={"Password"}
                           ref={el_ => this.controls.password = el_}
                        ></labeled-control>

                        <ion-button class="save-button ripple-parent" color="success" expand="block" onClick={async () => this.createPerson()}>Save
                           <ion-ripple-effect></ion-ripple-effect>
                        </ion-button>

                     </ion-card-content>
                  </ion-card>
               </div>
            </div>
         </Host>
      );
   }

}
