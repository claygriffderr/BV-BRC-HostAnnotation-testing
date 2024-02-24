
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Net;

using Terms = HostAnnotation.Common.Terms;

namespace HostAnnotationWeb.Models {
    
    // The response returned when a user logs in.
    public class LoginResponse {

        public bool isAuthenticated { get; set; }

        public string? message { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public Terms.api_role role { get; set; }

        public HttpStatusCode statusCode { get; set; }


        // C-tor
        public LoginResponse() {
            isAuthenticated = false;
            message = null;
            role = Terms.api_role.unknown;
            statusCode = HttpStatusCode.Unauthorized;
        }
    }
}
