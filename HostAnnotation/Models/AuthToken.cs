
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using Terms = HostAnnotation.Common.Terms;

namespace HostAnnotation.Models {

    // Authentication and authorization data that is encoded as (and decoded from) JWT tokens.
    public class AuthToken {

        // Expiration time (time after which the JWT expires)
        public DateTimeOffset? exp { get; set; }

        // Issued at time (time at which the JWT was issued; can be used to determine age of the JWT)
        public DateTimeOffset? iat { get; set; }

        // Issuer of the JWT
        public string? iss { get; set; }

        // The person's (optional) organization.
        public int? orgID { get; set; }
        public Guid? orgUID { get; set; }

        // The person ID
        public int personID { get; set; }

        // The person's UID
        public Guid? personUID { get; set; }

        // The person's API role
        [JsonConverter(typeof(StringEnumConverter))]
        public Terms.api_role role { get; set; }

    }
}
