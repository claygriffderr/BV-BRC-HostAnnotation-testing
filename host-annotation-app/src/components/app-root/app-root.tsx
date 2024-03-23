
import { AppRole, PageKey } from "../../global/Types";
import { AuthState } from "../../models/AuthState";
import { AuthService } from '../../services/AuthService';
import { Component, Element, h, State } from '@stencil/core';
import { Router } from "../../helpers/Router";


@Component({
   tag: 'app-root',
   styleUrl: 'app-root.css'
})
export class AppRoot {

   // The component will re-render when the AuthState is modified.
   @State() authState: AuthState;
   
   @Element() el: HTMLAppRootElement;



   async componentDidLoad() {

      // Get a reference to the ion-router Element.
      const routerEl = this.el.querySelector("ion-router") as HTMLIonRouterElement;
      if (!routerEl) { throw new Error("Invalid router Element"); }

      // Initialize the router object.
      Router.initialize(routerEl);
      return;
   }


   async componentWillLoad() {

      // Provide a callback that the AuthService can use to update the local AuthState.
      await AuthService.setAppRootCallback(this.updateAuthState.bind(this));

      // Have the AuthService try to restore it's AuthState from data storage.
      await AuthService.loadAuthState();
      return;
   }

   // Update the AuthState to force the component to re-render.
   async updateAuthState(authState_: AuthState) {
      this.authState = authState_;
      return;
   }


   render() {

      let routes;

      if (!this.authState.isAuthenticated) {

         console.log("unauthenticated routes")

         // Routes that don't require authentication.
         routes = [
            <ion-route-redirect from="/" to={`/${PageKey.login}`}></ion-route-redirect>,
            <ion-route url={`/${PageKey.login}`} component="login-page"></ion-route>,
            <ion-route url={`/${PageKey.resetPassword}`} component="reset-password-page"></ion-route>,
            <ion-route url="*" component="login-page"></ion-route>
         ];

      } else {

         console.log(`this.authState.appRole = ${this.authState.appRole}`)

         switch (this.authState.appRole) {

            case AppRole.curator:

               // Curator
               routes = [
                  <ion-route-redirect from="/" to={`/${PageKey.home}`}></ion-route-redirect>,
                  <ion-route url="/curation" component="curation-tabs">

                     <ion-route url="/home" component="tab-home">
                        <ion-route component="home-page"></ion-route>
                     </ion-route>

                     <ion-route url="/hosts" component="tab-hosts">
                        <ion-route component="hosts-page"></ion-route>
                     </ion-route>

                     <ion-route url="/curatedWords" component="tab-curated-words">
                        <ion-route component="curated-words-page"></ion-route>
                     </ion-route>

                     <ion-route url="/taxonomySearch" component="tab-taxonomy-search">
                        <ion-route component="taxonomy-search-page"></ion-route>
                     </ion-route>

                  </ion-route>,

                  <ion-route url={`/${PageKey.annotateHost}`} component="annotate-host-page"></ion-route>,
                  <ion-route url={`/${PageKey.editCuratedWord}`} component="edit-curated-word-page"></ion-route>,
                  <ion-route url={`/${PageKey.userProfile}`} component="user-profile-page"></ion-route>,
                  <ion-route url={`/${PageKey.viewHost}`} component="view-host-page"></ion-route>,
                  <ion-route url={`/${PageKey.test}`} component="test-page"></ion-route>
               ];

               break;

            case AppRole.viewer:

               // Viewer routes
               routes = [
                  <ion-route-redirect from="/" to="/app/home"></ion-route-redirect>,
                  <ion-route url={`/${PageKey.userProfile}`} component="user-profile-page"></ion-route>,
               ];

               // TODO???
               break;

            case AppRole.administrator:

               console.log("administrator routes")

               // Admin routes
               routes = [
                  <ion-route-redirect from="/" to={`/${PageKey.adminHome}`}></ion-route-redirect>,
                  <ion-route url={`/${PageKey.adminHome}`} component="admin-home-page"></ion-route>,
                  <ion-route url={`/${PageKey.createPerson}`} component="admin-create-person-page"></ion-route> 
               ];

               break;

            default:
               throw new Error("Invalid application role");
         }

         // Routes used by all application roles.
         routes = routes.concat([
            <ion-route url={`/${PageKey.login}`} component="login-page"></ion-route>,
            <ion-route url={`/${PageKey.privacyPolicy}`} component="privacy-policy"></ion-route>,
            <ion-route url={`/${PageKey.resetPassword}`} component="reset-password-page"></ion-route>,
            <ion-route url={`/${PageKey.termsOfService}`} component="terms-of-service"></ion-route>
         ]);
      }

      return (
         <ion-app>
            <ion-router useHash={true}>{routes}</ion-router>
            <ion-nav></ion-nav>
         </ion-app>
      )
   }
}
