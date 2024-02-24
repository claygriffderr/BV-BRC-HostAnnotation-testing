
import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";


enum AlertIcon {
   error = "error",
   info = "info",
   question = "question",
   success = "success",
   warning = "warning"
}

const DefaultTitles: { [icon_ in AlertIcon]: string } = {
   error: "Error!",
   info: "Info",
   question: "Question",
   success: "Success!",
   warning: "Warning"
}

export class AlertBuilder {

   protected static async displayAlert(icon_: AlertIcon, message_: string | HTMLElement,
      title_?: string, onClose_?: Function): Promise<SweetAlertResult<any>> {

      if (!icon_) { throw new Error("Unable to display alert: Invalid icon"); }
      if (!message_) { throw new Error("Unable to display alert: Invalid message"); }
      if (!title_) { title_ = DefaultTitles[icon_]; }

      let options: SweetAlertOptions = {
         html: message_,
         icon: icon_,
         titleText: title_
      }

      if (onClose_) { options.didClose = () => onClose_() }

      return Swal.fire(options);
   }

   static async displayConfirm(message_: string | HTMLElement, title_?: string, onCancel_?: Function,
      onConfirm_?: Function): Promise<void> {

      if (!message_) { throw new Error("Unable to display confirm: Invalid message"); }
      if (!title_) { title_ = DefaultTitles[AlertIcon.question]; }

      let options: SweetAlertOptions = {
         confirmButtonColor: "#5cb85c",
         html: message_,
         icon: AlertIcon.question,
         showCancelButton: true,
         titleText: title_
      }

      const result = await Swal.fire(options);
      if (result.isConfirmed) {
         if (onConfirm_) { await onConfirm_(); }
      } else {
         if (onCancel_) { await onCancel_(); }
      }

      return;
   }

   // Display an error message
   static async displayError(message_: string | HTMLElement, title_?: string, onClose_?: Function): Promise<SweetAlertResult<any>> {
      return this.displayAlert(AlertIcon.error, message_, title_, onClose_);
   }

   // Display an info message
   static async displayInfo(message_: string | HTMLElement, title_?: string, onClose_?: Function): Promise<SweetAlertResult<any>> {
      return this.displayAlert(AlertIcon.info, message_, title_, onClose_);
   }

   // Display a success message
   static async displaySuccess(message_: string | HTMLElement, title_?: string, onClose_?: Function): Promise<SweetAlertResult<any>> {
      return this.displayAlert(AlertIcon.success, message_, title_, onClose_);
   }

   // Display a warning message
   static async displayWarning(message_: string | HTMLElement, title_?: string, onClose_?: Function): Promise<SweetAlertResult<any>> {
      return this.displayAlert(AlertIcon.warning, message_, title_, onClose_);
   }

}
