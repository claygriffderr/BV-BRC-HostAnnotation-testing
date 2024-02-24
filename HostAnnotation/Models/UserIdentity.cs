

using System.Security.Claims;

using HostAnnotation.Common;


namespace HostAnnotation.Models {

    public class UserIdentity {

        // An (optional) error message.
        public string? errorMessage { get; set; }

        // Is the identity information valid?
        public bool isValid { get; set; }

        // The user's organization ID and UID.
        public int? orgID { get; set; }
        public Guid? orgUID { get; set; }

        // The person ID and UID.
        public int personID { get; set; }
        public Guid? personUID { get; set; }

        // The user's role
        public Terms.api_role role { get; set; }


        // C-tor
        public UserIdentity(ClaimsPrincipal user_) {

            // Set default values
            errorMessage = null;
            isValid = true;
            orgID = null;
            orgUID = null;
            personID = -1;
            personUID = null;
            role = Terms.api_role.unknown;
            
            // Does the User object in the HTTP context have any claims?
            if (user_.Claims == null || user_.Claims.Count() < 1) {
                errorMessage = "Invalid claims";
                isValid = false;
                return;
            }

            foreach (Claim claim in user_.Claims) {

                if (claim == null) { continue; }

                switch (claim.Type) {

                    case Names.IdentityClaimType.OrgID:
                        if (!string.IsNullOrEmpty(claim.Value) && int.TryParse(claim.Value, out int testOID)) { orgID = testOID; }
                        if (orgID == null) { isValid = false; }
                        break;

                    case Names.IdentityClaimType.OrgUID:
                        if (!string.IsNullOrEmpty(claim.Value)) { orgUID = new Guid(claim.Value); }
                        if (orgUID == null) { isValid = false; }
                        break;

                    case Names.IdentityClaimType.PersonID:
                        if (!string.IsNullOrEmpty(claim.Value) && int.TryParse(claim.Value, out int testPID)) { personID = testPID; }
                        if (personID < 1) { isValid = false; }
                        break;

                    case Names.IdentityClaimType.PersonUID:
                        if (!string.IsNullOrEmpty(claim.Value) && Guid.TryParse(claim.Value, out Guid testPUID)) { personUID = testPUID; }
                        if (personUID == null) { isValid = false; }
                        break;

                    case ClaimTypes.Role:
                        if (Enum.TryParse(claim.Value, out Terms.api_role testRole)) { role = testRole; }
                        if (role.Equals(Terms.api_role.unknown)) { isValid = false; }
                        break;
                }
            }
        }

    }
}
