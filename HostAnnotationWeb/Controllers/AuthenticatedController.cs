
using Microsoft.AspNetCore.Mvc;

using HostAnnotationWeb.Auth;
using HostAnnotation.Models;

namespace HostAnnotationWeb.Controllers {

    [ApiController]
    [AuthFilter]
    public abstract class AuthenticatedController : ControllerBase {

        // The identity of the authenticated user.
        public UserIdentity? _userIdentity { get; set; }

    }
}
