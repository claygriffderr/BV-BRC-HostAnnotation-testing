
using Microsoft.AspNetCore.Mvc.Filters;

using HostAnnotationWeb.Controllers;
using HostAnnotation.Models;

namespace HostAnnotationWeb.Auth {

    // This filter attribute should be added to the AuthenticatedController in order
    // to populate the authenticated user identity.
    public class AuthFilterAttribute : ActionFilterAttribute {

        public override void OnActionExecuting(ActionExecutingContext filterContext_) {

            // Set the controller's user identity information from the HTTP Context.
            SetUserIdentity(filterContext_);

            base.OnActionExecuting(filterContext_);
        }


        // Set the controller's user identity information from the HTTP Context.
        public void SetUserIdentity(ActionExecutingContext filterContext_) {

            // Make sure the Controller is valid and derived from AuthenticatedController.
            if (filterContext_.Controller == null || 
                !filterContext_.Controller.GetType().IsSubclassOf(typeof(AuthenticatedController))) { return; }

            AuthenticatedController? controller = (AuthenticatedController)filterContext_.Controller;
            
            // Validate the HTTP Context.
            if (filterContext_.HttpContext == null) { return; }

            // Set the controller's user identity.
            controller._userIdentity = new UserIdentity(filterContext_.HttpContext.User);
        }

    }
}
