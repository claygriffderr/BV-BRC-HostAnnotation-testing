
import { AuthService } from "../../../services/AuthService";
import { Component, Host, h, Prop } from '@stencil/core';
import { AppRole, HeaderControlType, IBoolFunction, ISideMenu, PageKey } from "../../../global/Types";
import { Router } from "../../../helpers/Router";
import { Settings } from "../../../global/Settings";
import { Utils } from "../../../helpers/Utils";


@Component({
   tag: 'authorized-header',
   styleUrl: 'authorized-header.css',
   shadow: true
})
export class AuthorizedHeader {

   appRole: AppRole;

   // If this optional customizable method is provided, it will be called before we return to the previous page.
   @Prop({ attribute: 'can-go-back', mutable: true })
   canGoBack: IBoolFunction = null;

   // The type of control to be displayed on the left side of the header.
   @Prop({ attribute: 'control-type', mutable: true })
   controlType: HeaderControlType;

   // The page's title
   @Prop({ attribute: 'page-title', mutable: true })
   pageTitle: string = null;

   // A side menu
   sideMenu: ISideMenu = null;

   @Prop({ attribute: 'use-default', mutable: true })
   useDefault: boolean = false;


   async componentWillLoad() {
      this.appRole = await AuthService.getAppRole();
      return;
   }

   displayControl() {

      switch (this.controlType) {

         case HeaderControlType.back:
            return <div class="menu-button back-control" onClick={() => this.goBack()}>
                  <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
               </div>;

         case HeaderControlType.menu:
            return <div class="menu-button" onClick={() => this.openMenu()}>
               <ion-icon slot="icon-only" name="menu" size="large"></ion-icon>
            </div>;

         case HeaderControlType.none:
            return <div class="empty-control"></div>;

         default:
            return "Invalid control type";
      }
   }

   displaySideMenu() {
      
      if (this.controlType !== HeaderControlType.menu) { return ""; }

      switch (this.appRole) {
         case AppRole.administrator: 
            return <admin-side-menu ref={(menu_: ISideMenu) => this.sideMenu = menu_}></admin-side-menu>

         case AppRole.curator:
            return <curator-side-menu ref={(menu_: ISideMenu) => this.sideMenu = menu_}></curator-side-menu>;

         default:
            throw new Error(`Unhandled app role ${this.appRole}`)
      }
   }

   displayTitle() {
      
      const titleText = this.useDefault 
         ? Utils.useMobileLayout ? Settings.appShortName : Settings.appLongName
         : !this.pageTitle ? "" : this.pageTitle;
  
      return <div class="page-title">{titleText}</div>;
   }

   // Handle the user clicking on a back button (in the header).
   async goBack() {

      let proceed = true;

      // If a "can go back" function was provided, call it to populate "proceed".
      if (this.canGoBack) { proceed = await this.canGoBack(); }

      // If "proceed" is true, return to the previous page.
      if (proceed) { Router.back(); }

      return;
   }

   // Navigate to the user profile page.
   async navigateToProfile() {

      switch (this.appRole) {
         case AppRole.curator:
            return await Router.push(`/${PageKey.userProfile}`);

         case AppRole.administrator:
            alert("TODO: create the admin user profile page")
            return false;

         default: throw new Error("Invalid application role");
      }
   }

   // Open the side menu.
   openMenu() {
      this.sideMenu.isOpen = true;
   }


   render() {
      return (
         <Host>
            {this.displaySideMenu()}
            <header>
               {this.displayControl()}
               {this.displayTitle()}
               <div class="user-control" onClick={() => this.navigateToProfile()}>
                  <ion-icon slot="icon-only" name="person-circle-outline" size="large"></ion-icon>
               </div>
            </header>
         </Host>
      );
   }

}