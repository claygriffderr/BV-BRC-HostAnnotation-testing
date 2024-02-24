

namespace HostAnnotationWeb.Controllers.Parameters {

    // Parameters for AdminController.
    public class AdminParams {


        // Input parameters for the CreatePerson method.
        public class CreatePersonForm {
            public string? email { get; set; }
            public string? firstName { get; set; }
            public string? lastName { get; set; }
            public string? orgUID { get; set; }
            public string? password { get; set; }
            public string? role { get; set; }
            public string? status { get; set; }

            public void sanitize() {
                if (email == "null") { email = null; }
                if (firstName == "null") { firstName = null; }
                if (lastName == "null") { lastName = null; }
                if (orgUID == "null") { orgUID = null; }
                if (password == "null") { password = null; }
                if (role == "null") { role = null; }
                if (status == "null") { status = null; }
            }
        }

    }
}
