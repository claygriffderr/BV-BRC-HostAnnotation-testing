

namespace HostAnnotationWeb.Controllers.Parameters {

    // Parameters for the CuratedWordController.
    public class CuratedWordParams {

        // Input parameters for the SearchCuratedWords method.
        public class SearchCuratedWordsForm {
            public string? searchText { get; set; }
            public string? type { get; set; }

            public void sanitize() {
                if (searchText == "null") { searchText = null; }
                if (type == "null") { type = null; }
            }
        }

    }
}
