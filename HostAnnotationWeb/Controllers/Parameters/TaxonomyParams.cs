

namespace HostAnnotationWeb.Controllers.Parameters {

    // Parameters for the TaxonomyController.
    public class TaxonomyParams {

        // Input parameters for the GetTaxonName method.
        public class GetTaxonNameForm {
            public string? id { get; set; }

            public void sanitize() {
                if (id == "null") { id = null; }
            }
        }

        // Input parameters for the SearchTaxonomyDatabases method.
        public class SearchTaxonomyDatabasesForm {
            public string? searchText { get; set; }
            public string? taxonomyDB { get; set; }

            public void sanitize() {
                if (searchText == "null") { searchText = null; }
                if (taxonomyDB == "null") { taxonomyDB = null; }
            }
        }

    }
}
