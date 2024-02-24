
import { AnimationBuilder, RouterDirection } from "@ionic/core";
import { IRouteChangeHandler, PageKey } from "../global/Types";


export class _Router {

   // Pages that register event handlers will be notified when the route changes to their pageKey.
   eventHandlers: Map<PageKey, IRouteChangeHandler>;

   // A reference to the ion-router's DOM Element.
   routerEl: HTMLIonRouterElement;

   
   // C-tor
   constructor() {
      this.eventHandlers = new Map<PageKey, IRouteChangeHandler>();
   }

   // Navigate to the previous location.
   async back(): Promise<void> {
      return await this.routerEl.back();
   }

   // Initialize the Router with a reference to the ion-router's DOM Element.
   initialize(routerEl_: HTMLIonRouterElement) {
      
      if (!routerEl_) { throw new Error("Invalid router Element in Router.initialize"); } 
      this.routerEl = routerEl_;

      // Handle the "route change" event.
      this.routerEl.addEventListener("ionRouteDidChange", (ev_) => {

         if (!ev_ || !ev_.detail || !ev_.detail.to) { return; }
         
         // Cast the "to" page as a PageKey.
         const routePage = ev_.detail.to as PageKey;

         // If an event handler callback has been registered for this page key, call it.
         if (this.eventHandlers.has(routePage)) { this.eventHandlers.get(routePage)(); }
      })
   }

   // Push a new location on the window history stack.
   async push(path_: string, direction_?: RouterDirection, animation_?: AnimationBuilder): Promise<boolean> {
      return await this.routerEl.push(path_, direction_, animation_);
   }

   // Pages that register event handlers using this method will be notified when the route changes to their pageKey.
   async registerEventHandler(pageKey_: PageKey, routeChangeCallback_: IRouteChangeHandler) {
      this.eventHandlers.set(pageKey_, routeChangeCallback_);
      return;
   }
}

// Create a singleton instance of _Router.
export const Router = new _Router();
