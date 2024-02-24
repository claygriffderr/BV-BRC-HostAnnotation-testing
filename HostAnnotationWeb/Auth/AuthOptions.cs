using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;

namespace HostAnnotationWeb.Auth {

    public class AuthOptions : AuthenticationSchemeOptions {

        public string? SecretKey { get; set; }
    }
}
