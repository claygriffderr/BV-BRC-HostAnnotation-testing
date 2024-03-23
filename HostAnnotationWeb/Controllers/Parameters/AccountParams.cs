

namespace HostAnnotationWeb.Controllers.Parameters {

    // Parameters for the AccountController.
    public class AccountParams {

        // Input parameters for the GetNameFromToken method.
        public class GetNameFromTokenForm {
            public string? requestType { get; set; }
            public string? token { get; set; }

            public void sanitize() {
                if (requestType == "null") { requestType = null; }
                if (token == "null") { token = null; }
            }
        }

        // Input parameters for the ResetPassword method.
        public class ResetPasswordForm {
            public string? password { get; set; }
            public string? token { get; set; }

            public void sanitize() {
                if (password == "null") { password = null; }
                if (token == "null") { token = null; }
            }
        }

    }
}
