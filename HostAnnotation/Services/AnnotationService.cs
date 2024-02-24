
using Microsoft.Extensions.Configuration;
using HostAnnotation.Common;
using HostAnnotation.Models;
using HostAnnotation.Utilities;
using HostAnnotation.DataProviders;
using System.Text;

namespace HostAnnotation.Services {

    public class AnnotationService : IAnnotationService {

        // The configuration properties.
        private readonly IConfiguration _configuration;

        // The data provider for annotation data.
        protected AnnotationDataProvider _dataProvider;

        // A service for curated words.
        protected ICuratedWordService _wordService;


        // C-tor
        public AnnotationService(IConfiguration configuration_, ICuratedWordService wordService_) {

            _configuration = configuration_;

            // Get and validate the database connection string.
            string? dbConnectionString = _configuration[Names.ConfigKey.DbConnectionString];
            if (string.IsNullOrEmpty(dbConnectionString)) { throw new Exception("Invalid database connection string"); }

            // Initialize the data provider
            _dataProvider = new AnnotationDataProvider(dbConnectionString);

            // A service for curated words.
            _wordService = wordService_;
        }

        
        public AnnotatedHost? annotateHostText(string initialText_) {

            AnnotatedHost? annotatedHost = null;

            // Load curated words
            CuratedWords? curatedWords =_wordService.getCuratedWords();
            if (curatedWords == null) { throw new Exception("Invalid curated words"); }

            // Remove the filtered characters from the initial text and populate the filtered text.
            string? filteredText = curatedWords.removeFilteredCharacters(initialText_);
            if (string.IsNullOrEmpty(filteredText)) { throw SmartException.create("Invalid text after removing filtered characters"); }

            // Is the host already in the database? If not, it will be added.
            bool isNew = true;

            // Is there already a host with this filtered text? If not, create the host. Either way, return the host ID.
            int hostID = _dataProvider.lookupHostID(filteredText, initialText_, ref isNew);

            if (!isNew) {
                // Return the annotated host.
                //return _dataProvider.getAnnotatedHost(hostID);
            }

            // Replace any subspecies qualifiers with a comma delimiter.
            filteredText = curatedWords.replaceSubspeciesQualifiers(filteredText);
            if (string.IsNullOrEmpty(filteredText)) { throw SmartException.create("Invalid text after replacing subspecies qualifiers"); }

            // Remove age/date text from the hostname.
            filteredText = Constants.AgeTextRegEx().Replace(filteredText, "").Trim();
            if (string.IsNullOrEmpty(filteredText)) { throw SmartException.create("Invalid text after removing age/date text"); }

            // Split the filtered host text on commas.
            string[] tokens = filteredText.Split(Constants.DELIMITER_COMMA, StringSplitOptions.RemoveEmptyEntries);

            // If no valid tokens were found, flag the host as invalid and return it.
            if (tokens == null || tokens.Length < 1) { throw SmartException.create("Invalid text: no host tokens were found"); }

            bool isOneOfMany = tokens.Length > 0;

            foreach (string token in tokens) {

                if (token == null) { continue; }

                string trimmedToken = token.Trim();
                if (trimmedToken.Length < 1) { continue; }

                // Create host token variations on the unmodified text.
                _dataProvider.createHostTokenVariations(trimmedToken, Terms.host_token_type.unmodified, hostID, isOneOfMany);

                //--------------------------------------------------------------------------------------------------------
                // Stop words
                //--------------------------------------------------------------------------------------------------------
                bool foundStopWord = false;

                string? stopWordsRemoved = curatedWords.removeStopWords(trimmedToken, ref foundStopWord);

                // If we found one or more stop words, create host token variations on the result text.
                if (foundStopWord && !string.IsNullOrEmpty(stopWordsRemoved)) { 
                    _dataProvider.createHostTokenVariations(stopWordsRemoved, Terms.host_token_type.stop_words_removed, hostID, isOneOfMany); 
                }

                //--------------------------------------------------------------------------------------------------------
                // Alt spellings or synonyms
                //--------------------------------------------------------------------------------------------------------
                bool foundAltOrSynonym = false;

                string? altOrSynonym = curatedWords.replaceAltSpellingsAndSynonyms(trimmedToken, ref foundAltOrSynonym);
                //if (string.IsNullOrEmpty(altOrSynonym)) { continue; }

                // If no alt spellings or synonyms were found in the trimmed token but stop words were found, look for 
                // alt spellings or synonyms in the token without stop words.
                if (!foundAltOrSynonym && foundStopWord && !string.IsNullOrEmpty(stopWordsRemoved)) {
                    altOrSynonym = curatedWords.replaceAltSpellingsAndSynonyms(stopWordsRemoved, ref foundAltOrSynonym);
                    if (foundAltOrSynonym && !string.IsNullOrEmpty(altOrSynonym)) { 
                        _dataProvider.createHostTokenVariations(altOrSynonym, Terms.host_token_type.alt_spelling_or_synonym, hostID, isOneOfMany);
                    }
                }
            }

            // Search taxonomy databases for all of the host tokens we just created.
            _dataProvider.searchTaxonName(hostID);

            // Create host token annotations
            _dataProvider.createHostTokenAnnotations(null, hostID);

            // Create the annotated host.
            _dataProvider.createAnnotatedHost(hostID);

            // Get the annotated host.
            annotatedHost = _dataProvider.getAnnotatedHost(hostID);

            return annotatedHost;
        }


        public AnnotatedHost? getAnnotatedHost(int hostID) {
            return _dataProvider.getAnnotatedHost(hostID);
        }


        public List<HostTaxonMatch>? getHostTaxaMatches(int hostID_) {
            return _dataProvider.getHostTaxaMatches(hostID_);
        }


        public List<AnnotatedHost>? searchAnnotatedHosts(string searchText_) {
            return _dataProvider.searchAnnotatedHosts(searchText_);
        }

    }
}
