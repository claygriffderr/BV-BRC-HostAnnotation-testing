
using Microsoft.Extensions.Configuration;
using HostAnnotation.Common;
using HostAnnotation.Models;
using HostAnnotation.Utilities;
using HostAnnotation.DataProviders;

namespace HostAnnotation.Services {

    public class CuratedWordService : ICuratedWordService {

        // The configuration properties.
        private readonly IConfiguration _configuration;

        // The data provider for curated words.
        protected CuratedWordDataProvider _dataProvider;


        // C-tor
        public CuratedWordService(IConfiguration configuration_) {

            _configuration = configuration_;

            // Get and validate the database connection string.
            string? dbConnectionString = _configuration[Names.ConfigKey.DbConnectionString];
            if (string.IsNullOrEmpty(dbConnectionString)) { throw new Exception("Invalid database connection string"); }

            // Initialize the data provider
            _dataProvider = new CuratedWordDataProvider(dbConnectionString);
        }


        // Get a specific curated word.
        public CuratedWord? getCuratedWord(Guid uid_) {
            return _dataProvider.getWord(uid_);
        }

        // Get all valid curated words.
        public CuratedWords? getCuratedWords() {

            List<CuratedWord>? words = _dataProvider.getValidWords();

            // Create and initialize an instance of CuratedWords.
            return new CuratedWords(words);
        }

        // Search all curated words.
        public List<CuratedWord>? searchCuratedWords(string? searchText_, Terms.curation_type? type_ = null) {
            return _dataProvider.search(searchText_, type_);
        }

    }
}
