
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using System.Security.Claims;
using System.Text.Encodings.Web;

using HostAnnotation.Common;
using HostAnnotation.Models;
using HostAnnotation.Utilities;

namespace HostAnnotationWeb.Auth {

    public class AuthHandler : AuthenticationHandler<AuthOptions> {

        private JwtTools _jwtTools { get; set; }


        // C-tor
        public AuthHandler(
            IOptionsMonitor<AuthOptions> options_,
            ILoggerFactory logger_,
            UrlEncoder encoder_
        ) : base(options_, logger_, encoder_) {

            _jwtTools = new JwtTools();
        }

        
        protected override async Task<AuthenticateResult> HandleAuthenticateAsync() {

            // The current timestamp
            DateTimeOffset now = DateTimeOffset.Now;

            // Is there an Authorization header in the HTTP Request?
            if (!Request.Headers.TryGetValue(Names.Header.Authorization, out StringValues headers)) {
                return AuthenticateResult.NoResult();
            }

            // Make sure the JSON Web Token exists and isn't empty.
            string? token = headers.First();
            if (Utils.isEmptyElseTrim(ref token)) {
                return AuthenticateResult.NoResult();
            }

            // Validate the secret key.
            if (string.IsNullOrEmpty(Options.SecretKey)) { 
                return AuthenticateResult.Fail("Unable to authenticate: Invalid secret key"); 
            }

            // Decode the JWT and deserialize as an AuthToken object.
            AuthToken? authToken = _jwtTools.decode<AuthToken>(Options.SecretKey, token);

            // Validate the auth token and make sure it hasn't expired.
            if (authToken == null) {
                return AuthenticateResult.Fail("Unable to authenticate: Unable to process token");

            } else if (authToken.iss != Names.TOKEN_ISSUER || authToken.orgID == null || authToken.orgUID == null ||
                authToken.personID < 1 || authToken.personUID == null) { 
                return AuthenticateResult.Fail("Unable to authenticate: Invalid authentication data");

            } else if (authToken.exp != null && authToken.exp.Value < now) {
                return AuthenticateResult.Fail("Your token has expired. Please authenticate again.");
            }

            // Convert the person's role to a string.
            string? role = Terms.enumString(authToken.role);
            if (role == null) { return AuthenticateResult.Fail("Unable to authenticate: Invalid role"); }


            // Populate the Claims collection with the person ID and role.
            var claims = new List<Claim>() {
                new Claim(Names.IdentityClaimType.OrgID, authToken.orgID.Value.ToString()),
                new Claim(Names.IdentityClaimType.OrgUID, authToken.orgUID.Value.ToString()),
                new Claim(Names.IdentityClaimType.PersonID, authToken.personID.ToString()),
                new Claim(Names.IdentityClaimType.PersonUID, authToken.personUID!.Value.ToString()),
                new Claim(ClaimTypes.Role, role)
            };
            
            // Create the Claims identity, principal, and ticket.
            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        
}

}
