
import { Component, Element, h, Host, Method, Prop, State } from '@stencil/core';

@Component({
  tag: 'bvbrc-dialog',
  styleUrl: 'bvbrc-dialog.css',
  shadow: true,
})
export class BvbrcDialog {

   // Slot names
   static BodySlotName = "body-slot";
   static FooterSlotName = "footer-slot";
   static TitleSlotName = "title-slot";


   @Prop({ attribute: 'cancel-icon', mutable: true, reflect: true })
   cancelIcon: string;

   @Prop({ attribute: 'cancel-label', mutable: true, reflect: true })
   cancelLabel: string = "Cancel";

   @Element() el: HTMLBvbrcDialogElement;

   @State() isOpen: boolean = false;


   // Close the dialog
   @Method()
   async close() {
      await this.doBeforeClose();
      this.isOpen = false;
      return;
   }

   async componentDidLoad() {

      // Get the modal background and add a click event handler to it.
      const modalBackground: HTMLDivElement = this.el.shadowRoot.querySelector(".modal-background");
      if (!modalBackground) { throw new Error("Invalid modal background"); }

      modalBackground.addEventListener("click", () => {
         console.log("in click event handler");
         this.isOpen = false;
      });

      return;
   }

   displayCancelIcon() {
      return !this.cancelIcon ? "" : <ion-icon name={this.cancelIcon} size="medium"></ion-icon>;
   }

   async doBeforeClose() {
      return;
   }

   async doBeforeOpen() {
      return;
   }

   // Open the dialog
   @Method()
   async open() {
      await this.doBeforeOpen();
      this.isOpen = true;
      return;
   }


   render() {
      return (
         <Host>
            <div class="modal-container" data-is-open={this.isOpen.toString()}>

               <div class="modal-dialog">
                  <div class="modal-header">
                     <div class="title">
                        <slot name={BvbrcDialog.TitleSlotName}></slot>
                     </div>
                     <div class="close-icon" onClick={() => this.close()}>
                        <ion-icon slot="icon-only" name="close" size="medium"></ion-icon>
                     </div>
                  </div>

                  <div class="modal-body">
                     <slot name={BvbrcDialog.BodySlotName}></slot>
                  </div>

                  <div class="modal-footer">
                     <slot name={BvbrcDialog.FooterSlotName}></slot>
                     <ion-button class="ripple-parent" color="light" mode="ios" size="small" onClick={async () => this.close()}>
                        {this.displayCancelIcon()} {this.cancelLabel}
                        <ion-ripple-effect></ion-ripple-effect>
                     </ion-button>
                  </div>
               </div>

               <div class="modal-background"></div>
            </div>
         </Host>
      );
   }

}
