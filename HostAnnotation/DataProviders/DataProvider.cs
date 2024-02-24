

namespace HostAnnotation.DataProviders {

    // A base class for data access layer objects.
    public abstract class DataProvider {

        protected string _dbConnectionString;

        // C-tor
        public DataProvider(string dbConnectionString) {
            _dbConnectionString = dbConnectionString;
        }
    }
}
