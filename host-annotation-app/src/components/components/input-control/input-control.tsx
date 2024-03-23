
import { Component, h, Prop } from '@stencil/core';
import { ControlType } from "./InputControlTypes";


@Component({
   tag: 'input-control',
   styleUrl: 'input-control.css'
})
export class InputControl {

   @Prop() controlType: ControlType;

   @Prop() cssClassNames: string[];

   @Prop() isReadOnly: boolean;

   @Prop() labelText: string;
   
   @Prop() value: string;


   getClassList() {
      
      if (!this.cssClassNames || this.cssClassNames.length < 1) { return ""; }

      let list = "";
      this.cssClassNames.forEach((className_: string) => {
         if (list.length > 0) { list += ","; }
         list += className_;
      })

      return list;
   }


   render() {

      switch (this.controlType) {
         case ControlType.input:

            return (
               <input class={this.getClassList()} value={this.value || ""} />
            )

         case ControlType.select:

            return (
               <select class={this.getClassList()}></select>
            );

         case ControlType.textarea:

            return (
               <textarea  class={this.getClassList()}>{this.value}</textarea>
            );

         default:
            throw new Error("Invalid control type");
      }
   }

}
