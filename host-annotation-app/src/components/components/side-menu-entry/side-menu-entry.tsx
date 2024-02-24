
import { Component, Host, h, Prop } from '@stencil/core';

@Component({
   tag: 'side-menu-entry',
   styleUrl: 'side-menu-entry.css',
   shadow: true,
})
export class SideMenuEntry {

   @Prop({ attribute: 'icon', mutable: true, reflect: true })
   icon: string;

   @Prop({ attribute: 'label', mutable: true, reflect: true })
   label: string;

   render() {
      return (
         <Host>
            <div class="container">
               <ion-icon slot="start" name={this.icon || ""}></ion-icon>
               <div class="label">{this.label || ""}</div>
            </div>
         </Host>
      );
   }

}
