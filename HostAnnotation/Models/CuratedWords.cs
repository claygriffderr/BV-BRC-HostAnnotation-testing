
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

using HostAnnotation.Common;
using HostAnnotation.Utilities;


namespace HostAnnotation.Models {

    public class CuratedWords {

        public List<CuratedWord> altSpellingAndSynonyms { get; set; }

        public List<CuratedWord> filteredCharacters { get; set; }

        public List<CuratedWord> stopWords { get; set; }

        public List<CuratedWord> subspeciesQualifiers { get; set; }


        // C-tor
        public CuratedWords(List<CuratedWord>? words_) {
            
            // Initialize the curated word collections.
            altSpellingAndSynonyms = new List<CuratedWord>();
            filteredCharacters = new List<CuratedWord>();
            stopWords = new List<CuratedWord>();
            subspeciesQualifiers = new List<CuratedWord>();

            initialize(words_);
        }


        public void initialize(List<CuratedWord>? words_) {

            if (words_ == null || words_.Count < 1) { throw SmartException.create("No curated words were returned"); }

            try {
                foreach (CuratedWord word in words_) {

                    if (word == null) { throw new Exception("Invalid curated word"); }

                    switch (word.type) {
                        case Terms.curation_type.alternate_spelling:
                        case Terms.curation_type.synonym:

                            if (string.IsNullOrEmpty(word.searchTextFiltered)) { continue; }
                            if (string.IsNullOrEmpty(word.alternateTextFiltered)) { continue; }

                            altSpellingAndSynonyms.Add(word);
                            break;

                        case Terms.curation_type.filtered_characters:

                            if (string.IsNullOrEmpty(word.searchTextFiltered)) { continue; }

                            filteredCharacters.Add(word);
                            break;

                        case Terms.curation_type.stop_word:

                            if (string.IsNullOrEmpty(word.searchTextFiltered)) { continue; }

                            stopWords.Add(word);
                            break;
                        case Terms.curation_type.subspecies_qualifier:

                            if (string.IsNullOrEmpty(word.searchTextFiltered)) { continue; }

                            subspeciesQualifiers.Add(word);
                            break;
                    }
                }
            }
            catch(Exception e) {
                throw SmartException.create(e.Message);
            }
        }



        // Remove filtered characters from the initial text.
        public string? removeFilteredCharacters(string? initialText_) {

            if (Utils.isEmptyElseTrim(ref initialText_)) { return null; }

            string modifiedText = initialText_!;

            foreach (CuratedWord fc_ in filteredCharacters) {

                if (fc_ == null || string.IsNullOrEmpty(fc_.searchTextFiltered) || string.IsNullOrEmpty(fc_.alternateTextFiltered)) { continue; }

                modifiedText = modifiedText.Replace(fc_.searchTextFiltered!, fc_.alternateTextFiltered);
            }

            return modifiedText.Trim();
        }


        // Remove any matching stop words from the filtered text, regardless of whether they appear 
        // first, last, or somewhere in the middle.
        public string? removeStopWords(string? filteredText_, ref bool foundMatch_) {

            foundMatch_ = false;

            if (Utils.isEmptyElseTrim(ref filteredText_)) { return null; }

            string? modifiedText = filteredText_;

            foreach (CuratedWord stopWord in stopWords) {

                // Validate the curated word.
                if (stopWord == null || string.IsNullOrEmpty(stopWord.searchTextFiltered) || string.IsNullOrEmpty(stopWord.alternateTextFiltered)) { continue; }

                // Is the stop word in the modified text?
                if (modifiedText!.IndexOf(stopWord.searchTextFiltered!, StringComparison.CurrentCultureIgnoreCase) < 0) { continue; }

                // Try to remove the stop word from the start of the text.
                modifiedText = Regex.Replace(modifiedText, $@"^{stopWord.searchTextFiltered}\s+", "", RegexOptions.IgnoreCase);

                // Try to remove the stop word from the middle of the text.
                modifiedText = Regex.Replace(modifiedText, $@"\s+{stopWord.searchTextFiltered}\s+", " ", RegexOptions.IgnoreCase);

                // Try to remove the stop word from the end of the text.
                modifiedText = Regex.Replace(modifiedText, $@"\s+{stopWord.searchTextFiltered}$", "", RegexOptions.IgnoreCase);
            }

            if (Utils.isEmptyElseTrim(ref modifiedText)) { return null; }

            modifiedText = modifiedText!.Trim();

            // Were any stop words found?
            foundMatch_ = !modifiedText!.Equals(filteredText_, StringComparison.CurrentCultureIgnoreCase);

            return modifiedText;
        }


        // Replace any alternate names or synonyms found in the filtered text. 
        public string? replaceAltSpellingsAndSynonyms(string? filteredText_, ref bool foundMatch_) {

            foundMatch_ = false;

            if (Utils.isEmptyElseTrim(ref filteredText_)) { return null; }

            string? modified = filteredText_;

            foreach (CuratedWord cw in altSpellingAndSynonyms) {

                // Validate the curated word.
                if (cw == null ||
                    string.IsNullOrEmpty(cw.searchTextFiltered) ||
                    string.IsNullOrEmpty(cw.alternateTextFiltered)) { continue; }
            
                // Compare the modified text to the alt spelling or synonym's search text (filtered).
                if (modified!.Equals(cw.searchTextFiltered, StringComparison.CurrentCultureIgnoreCase)) {
                    modified = cw.alternateTextFiltered;
                    foundMatch_ = true;
                    break;
                }
            }

            return modified;
        }


        // Replace any subspecies qualifiers found in the filtered text.
        public string? replaceSubspeciesQualifiers(string? filteredText_) {

            if (string.IsNullOrEmpty(filteredText_)) { return filteredText_; }

            string? modified = filteredText_;

            foreach (CuratedWord qualifier_ in subspeciesQualifiers) {
                
                if (qualifier_ == null || 
                    string.IsNullOrEmpty(qualifier_.searchTextFiltered) ||
                    string.IsNullOrEmpty(qualifier_.alternateTextFiltered)) { continue; }

                modified = modified.Replace(qualifier_.searchTextFiltered, qualifier_.alternateTextFiltered);
            }

            return modified;
        }

    }
}
