
import { Component, Element, Host, h, Method, Prop } from '@stencil/core';
import { ControlType, GenericStatus, LabelOrientation } from "../../../global/Types";
import { IChangeData, IChangeHandler, IControlListOption, IKeyPressHandler, listOptionsToHTML } from "./Common";


@Component({
   tag: 'labeled-control',
   styleUrl: 'labeled-control.css',
   shadow: true,
})
export class LabeledControl {

   @Prop({ attribute: "attr-key", mutable: true, reflect: true })
   attributeKey: string = null;

   @Prop({ attribute: "change-handler", mutable: true, reflect: true })
   changeHandler: IChangeHandler = null;

   controlEl: HTMLElement;

   @Prop({ attribute: "ctrl-type", mutable: true, reflect: true })
   controlType: ControlType = ControlType.text;

   @Element() el: HTMLLabeledControlElement;

   @Prop({ attribute: "initial-value", mutable: true, reflect: true })
   initialValue: any = null;

   @Prop({ attribute: "is-disabled", mutable: true, reflect: true })
   isDisabled: boolean = false;

   @Prop({ attribute: "is-readonly", mutable: true, reflect: true })
   isReadOnly: boolean = false;

   @Prop({ attribute: "is-required", mutable: true, reflect: true })
   isRequired: boolean = false;

   @Prop({ attribute: "keypress-handler", mutable: true, reflect: true })
   keypressHandler: IKeyPressHandler = null;

   @Prop({ attribute: "keyup-handler", mutable: true, reflect: true })
   keyupHandler: IChangeHandler = null;

   @Prop({ attribute: "label-orientation", mutable: true, reflect: true })
   labelOrientation: LabelOrientation = LabelOrientation.left;

   @Prop({ attribute: "label-text", mutable: true, reflect: true })
   labelText: string = null;

   @Prop({ attribute: "list-options", mutable: true, reflect: true })
   listOptions: IControlListOption[];

   @Prop()
   spellcheck: boolean = false;

   @Prop({ attribute: "status", mutable: true, reflect: true })
   status: GenericStatus = GenericStatus.unspecified;

   @Prop({ attribute: "status-message", mutable: true, reflect: true })
   statusMessage: string = null;

   @Prop()
   textAreaRows: number = 3;

   @Prop({ attribute: "text-placeholder", mutable: true, reflect: true })
   textPlaceholder: string = null;



   async componentDidLoad() {

      // Get the control Element
      this.controlEl = this.el.shadowRoot.querySelector(".control");
      if (!this.controlEl) { throw new Error("Invalid control Element"); }

      if (this.changeHandler) {

         // Add an event handler for "change".
         this.controlEl.addEventListener("change", async () => {

            // Get the control's current value.
            let value = await this.getValue();

            // Call the change handler with info about what changed.
            this.changeHandler({
               attributeKey: this.attributeKey,
               value: value
            } as IChangeData);
         })
      }

      if (this.keypressHandler) {

         // Add an event handler for "keypress".
         this.controlEl.addEventListener("keypress", async (event_: KeyboardEvent) => {

            // Call the keypress handler with the key that was pressed.
            this.keypressHandler(!event_ ? "" : event_.key);
         })
      }

      if (this.keyupHandler) {

         // Add an event handler for "keyup".
         this.controlEl.addEventListener("keyup", async () => {

            // Get the control's current value.
            let value = await this.getValue();

            // Call the keyup handler with info about what changed.
            this.keyupHandler({
               attributeKey: this.attributeKey,
               value: value
            } as IChangeData);
         })
      }

      if (!this.isReadOnly) {

         // When the control is clicked, reset its status.
         this.controlEl.addEventListener("click", () => {
            this.status = GenericStatus.unspecified;
         })
      }

      return;
   }

   async componentDidUpdate() {

      if (!this.isReadOnly) {

         // For a "success" status, fadeout the right status Element's contents by 
         // adding the "success-fade" CSS class.
         const rightStatusEl = this.el.shadowRoot.querySelector(".right-status");
         if (!rightStatusEl) { throw new Error("Invalid right status Element"); }

         rightStatusEl.classList.remove("success-fade");

         if (this.status === GenericStatus.success) {
            setTimeout(() => {
               rightStatusEl.classList.add("success-fade");
            }, 500);
         }
      }

      return;
   }

   displayControl() {

      let cssClass = `control`;

      // TODO: should we also change control type to "readonly"?
      if (this.isReadOnly) { cssClass += ' read-only'; }

      switch (this.controlType) {

         case ControlType.select:
            return <select class={cssClass} disabled={this.isDisabled}>
               {listOptionsToHTML(this.listOptions, this.getInitialValue())}
            </select>;

         case ControlType.password:
            return <input type="password" class={cssClass} disabled={this.isDisabled} value={this.getInitialValue()} />

         case ControlType.text:
            return <input type="text" class={cssClass} disabled={this.isDisabled} placeholder={this.textPlaceholder}
               spellcheck={this.spellcheck} value={this.getInitialValue()} />

         case ControlType.textArea:
            // rows={this.textAreaRows}
            return <textarea class={cssClass} disabled={this.isDisabled} placeholder={this.textPlaceholder}
               spellcheck={this.spellcheck} value={this.getInitialValue()}></textarea>

         default:
            return <div class={cssClass}>{this.getInitialValue()}</div>
      }
   }

   displayLabel() {
      if (this.labelOrientation === LabelOrientation.none || !this.labelText || this.labelText.length < 1) {
         return "";
      } else {
         return <div class={`label ${this.isRequired ? " required" : ""}`}>{this.labelText}</div>
      }
   }

   displayLowerStatus() {
      return <div class="lower-status">{this.getStatusMessage()}</div>;
   }

   displayRightStatus() {
      return <div class="right-status">
         <ion-icon name="checkmark" size="large"></ion-icon>
      </div>;
   }


   getAttributeKey(): string {
      return !this.attributeKey ? "" : this.attributeKey;
   }

   getInitialValue(): string {
      return !this.initialValue ? "" : this.initialValue;
   }

   getLabelOrientation(): string {
      return !this.labelOrientation ? LabelOrientation.left : this.labelOrientation;
   }

   getLabelText(): string {
      return !this.labelText ? "" : this.labelText;
   }

   getStatusMessage(): string {
      return !this.statusMessage ? "" : this.statusMessage;
   }

   @Method()
   async getValue() {

      switch (this.controlType) {

         case ControlType.password:
         case ControlType.text:
            return (this.controlEl as HTMLInputElement).value;

         case ControlType.select:
            return (this.controlEl as HTMLSelectElement).value;

         case ControlType.textArea:
            return (this.controlEl as HTMLTextAreaElement).value;

         default:
            throw new Error(`Unhandled control type ${this.controlType}`);
      }
   }


   render() {
      return (
         <Host>
            <div class="container"
               data-attr-key={this.getAttributeKey()}
               data-orient={this.getLabelOrientation()}
               data-status={this.status}>

               {this.displayLabel()}

               <div class="control-group">
                  <slot name="before-control"></slot>
                  {this.displayControl()}
                  <slot name="after-control"></slot>
                  {this.displayRightStatus()}
               </div>

               {this.displayLowerStatus()}
            </div>
         </Host>
      );
   }

}
