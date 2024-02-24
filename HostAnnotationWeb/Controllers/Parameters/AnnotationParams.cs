

namespace HostAnnotationWeb.Controllers.Parameters {

    // Parameters for the AnnotationController.
    public class AnnotationParams {

        // Input parameters for the AnnotateHostText method.
        public class AnnotateHostTextForm {
            public string? hostText { get; set; }

            public void sanitize() {
                if (hostText == "null") { hostText = null; }
            }
        }

        // Input parameters for the GetAnnotatedHost method.
        public class GetAnnotatedHostForm {
            public string? hostID { get; set; }

            public void sanitize() {
                if (hostID == "null") { hostID = null; }
            }
        }

        // Input parameters for the GetHostTaxaMatches method.
        public class GetHostTaxaMatchesForm {
            public string? hostID { get; set; }

            public void sanitize() {
                if (hostID == "null") { hostID = null; }
            }
        }

        // Input parameters for the SearchAnnotatedHosts method.
        public class SearchAnnotatedHostsForm {
            public string? searchText { get; set; }

            public void sanitize() {
                if (searchText == "null") { searchText = null; }
            }
        }
    }
}
