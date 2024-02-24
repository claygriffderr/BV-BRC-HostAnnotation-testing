
import { AlertBuilder } from "../../../helpers/AlertBuilder";
import { AuthService } from "../../../services/AuthService";
import { Component, Element, h, Host, Prop } from '@stencil/core';
import { Router } from "../../../helpers/Router";
import { ISideMenu, PageKey } from "../../../global/Types";


@Component({
   tag: 'curator-side-menu',
   styleUrl: 'curator-side-menu.css'
})
export class CuratorSideMenu implements ISideMenu {

   @Element()
   el: HTMLCuratorSideMenuElement;

   @Prop({ mutable: true, reflect: true })
   isOpen: boolean = false;


   componentDidLoad() {

      // Get the menu background and add a click event handler to it.
      const menuBackground: HTMLElement = this.el.querySelector(".menu-background");
      if (!menuBackground) { throw new Error("Invalid menu background"); }

      menuBackground.addEventListener("click", () => {
         this.isOpen = false;
      });
   }

   async handleLogout() {

      await AlertBuilder.displayConfirm("Are you sure you want to logout?", "Logout", null, async () => {

         // Logout and navigate to the login page.
         await AuthService.logout();

         Router.push(`/${PageKey.login}`, "root");
      })
      return;
   }

   navigate(pageKey_: PageKey) {

      Router.push(`/${pageKey_}`);

      // Close the side menu
      this.isOpen = false;
   }

   render() {
      return (
         <Host>
            <div class={this.isOpen == true ? "side-menu open" : "side-menu closed"}>
               <div class="menu-container">
                  <div class="menu-body">
                     <div class="menu-header">
                        <div class="label">Menu</div>
                     </div>
                     <div class="menu-rows">

                        <side-menu-entry onClick={() => this.navigate(PageKey.home)}
                           icon="home-outline"
                           label="Home"
                        ></side-menu-entry>

                        <side-menu-entry onClick={() => this.navigate(PageKey.hosts)}
                           icon="bug-outline"
                           label="Hosts"
                        ></side-menu-entry>

                        <side-menu-entry onClick={() => this.navigate(PageKey.curatedWords)}
                           icon="create-outline"
                           label="Curated Words"
                        ></side-menu-entry>

                        <side-menu-entry onClick={() => this.navigate(PageKey.taxonomySearch)}
                           icon="search-outline"
                           label="Taxonomy Search"
                        ></side-menu-entry>

                        <side-menu-entry onClick={() => this.handleLogout()}
                           icon="log-out"
                           label="Logout"
                        ></side-menu-entry>

                     </div>
                  </div>
               </div>
               <div class="menu-background"></div>
            </div>
         </Host>
      );
   }

}