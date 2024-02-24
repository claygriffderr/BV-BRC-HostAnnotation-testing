
using Microsoft.Extensions.Configuration;
using HostAnnotation.Common;
using HostAnnotation.Models;
using HostAnnotation.Utilities;

namespace HostAnnotation.Services {

    public class TokenService : ITokenService {

        // The configuration properties.
        private readonly IConfiguration _configuration;

        // How many seconds until a new token will expire?
        protected double? _expirationInSeconds;

        //protected static string TOKEN_ISSUER = "TREK-PAD";

        // Tools used to encode and decode JSON Web Tokens (JWT).
        protected JwtTools _jwtTools;

        // The secret key
        protected string? _secretKey;

        // A suffix to add to a service type when generating a role name.
        //public const string ROLE_SUFFIX = "_api_user";


        // C-tor
        public TokenService(IConfiguration configuration_) {

            _configuration = configuration_;

            // How many seconds until a new token will expire?
            string? testString = _configuration[Names.ConfigKey.TokenExpirationInSeconds];
            _expirationInSeconds = string.IsNullOrEmpty(testString) ? null : Convert.ToDouble(testString);

            // Initialize the JWT tools.
            _jwtTools = new JwtTools();

            // The secret key used for authentication.
            _secretKey = _configuration[Names.ConfigKey.AuthSecret];
        }
        

        // Create an auth token.
        public string? createToken(Person? person_) {

            if (person_ == null || person_.id < 1) { throw SmartException.create("Invalid person"); }
            if (_secretKey == null) { throw SmartException.create("Invalid secret key"); }

            // When will the token expire?
            DateTimeOffset? expiration = null;
            if (_expirationInSeconds != null && _expirationInSeconds.Value > 0) {
                expiration = DateTimeOffset.Now.AddSeconds(_expirationInSeconds.Value);
            }

            // Generate data for the auth token.
            AuthToken authToken = new AuthToken() {

                // Expiration time (time after which the JWT expires)
                exp = expiration,

                // Issued at time (time at which the JWT was issued; can be used to determine age of the JWT)
                iat = DateTimeOffset.Now,

                // Issuer of the JWT
                iss = Names.TOKEN_ISSUER,

                // The person's (optional) site.
                orgID = person_.organizationID,
                orgUID = person_.organizationUID,

                // The person's ID and UID.
                personID = person_.id,
                personUID = person_.uid,

                // The person's application role
                role = person_.role
            };

            // Generate a JWT from the auth token data.
            return _jwtTools.encodeEncryptedAndSigned(authToken, _secretKey);
        }


        // Decode a JWT auth token.
        public AuthToken? decodeToken(string? token_) {

            if (Utils.isEmptyElseTrim(ref token_)) { return null; }
            if (_secretKey == null) { throw SmartException.create("Invalid secret key"); }

            return _jwtTools.decodeEncrypted<AuthToken>(_secretKey, token_);
        }

    }
}
