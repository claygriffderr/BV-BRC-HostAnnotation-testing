
import { Component, Element, Host, h, Method, Prop, State } from '@stencil/core';
import { ButtonSize, CustomIcon, GenericStatus, IUIEventHandler } from "../../../global/Types";


@Component({
   tag: 'bvbrc-button',
   styleUrl: 'bvbrc-button.css',
   shadow: true,
})
export class BvbrcButton {

   // If provided, the button key is included in the button's CSS class name list.
   @Prop({ attribute: "button-key", mutable: true, reflect: true })
   buttonKey: string = null;

   @State() buttonState: boolean;

   // The method that is called when the button is clicked.
   @Prop({ attribute: "click-handler", mutable: true, reflect: true })
   clickHandler: IUIEventHandler = null;

   // A reference to the button Element.
   @Element() el: HTMLBvbrcButtonElement;

   // To display an icon in the button, provide its name here.
   @Prop({ attribute: "icon", mutable: true, reflect: true })
   icon: string = null;

   // Should the icon be displayed to the right or left of the label?
   @Prop({ attribute: "icon-on-right", mutable: true, reflect: true })
   iconOnRight: boolean = false;

   // Is the button disabled?
   @Prop({ attribute: "is-disabled", mutable: true, reflect: true })
   isDisabled: boolean = false;

   @Prop({ attribute: "is-loading", mutable: true, reflect: true })
   isLoading: boolean = false;

   // The button's label text.
   @Prop({ attribute: "label", mutable: true, reflect: true })
   label: string;

   @Prop()
   loadingIcon: string = CustomIcon.spinner;

   @Prop()
   loadingLabel: string = "Loading";

   // How large is the button?
   @Prop()
   size: ButtonSize = ButtonSize.medium;

   // The status determines the button's color scheme.
   @Prop({ attribute: "status", mutable: true, reflect: true })
   status: GenericStatus = null;


   // C-tor
   constructor() {
      // dmd test 121423
      this.buttonState = true;
   }

   // Display an icon to the left of the label (if an icon name was provided and "iconOnRight" is false).
   displayLeftIcon(icon_: string) {
      return (!icon_ || icon_.length < 1 || this.iconOnRight) ? "" : <ion-icon slot="start" name={icon_} size="medium"></ion-icon>;
   }

   // Display an icon to the right of the label (if an icon name was provided and "iconOnRight" is true).
   displayRightIcon(icon_: string) {
      return (!icon_ || icon_.length < 1 || !this.iconOnRight) ? "" : <ion-icon slot="end" name={icon_} size="medium"></ion-icon>;
   }

   // Handle click events
   async handleClick(event_: UIEvent) {

      // Validate the click handler.
      if (!this.clickHandler) { throw new Error("Invalid click handler"); }

      // If the button is disabled, cancel the event.
      if (this.isDisabled) {
         event_.preventDefault();
         event_.stopPropagation();
         return;
      }

      return this.clickHandler(event_);
   }


   @Method()
   async refresh() {
      this.buttonState = !this.buttonState;
      return;
   }


   render() {

      // Choose the icon or "loading" icon.
      const icon = this.isLoading ? this.loadingIcon : this.icon;

      const isDisabled = this.isDisabled || this.isLoading;

      // If a button key was provided, include it in the button's CSS class.
      const keyClass = this.buttonKey && this.buttonKey.length > 0 ? ` ${this.buttonKey}` : "";

      // Choose the label or "loading" label.
      const label = this.isLoading ? this.loadingLabel : this.label;

      return (
         <Host>
            <button
               class={`${this.size} ${this.status || "transparent"}${keyClass}`}
               disabled={isDisabled}
               onClick={(event_: UIEvent) => this.handleClick(event_)}>
               {this.displayLeftIcon(icon)}
               <label>{label || ""}</label>
               {this.displayRightIcon(icon)}
            </button>
         </Host>
      );
   }

}
