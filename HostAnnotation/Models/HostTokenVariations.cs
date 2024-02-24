
using System;
using System.Collections.Generic;

using HostAnnotation.Utilities;


namespace HostAnnotation.Models {
    
	public class HostTokenVariations {

        // add_s_to_end
        public string? addSToEnd { get; set; }
		
		// append_spdot
		public string? appendSpDot { get; set; }
		
		public string? baseToken { get; set; }
        
		// minus_one_word_left
		public string? minusOneWordLeft { get; set; }

        // minus_one_word
        public string? minusOneWordRight { get; set; }

        // minus_two_words_left
        public string? minusTwoWordsLeft { get; set; }

        // minus_two_words
        public string? minusTwoWordsRight { get; set; }

        // minus_three_words_left
        public string? minusThreeWordsLeft { get; set; }

        // minus_three_words
        public string? minusThreeWordsRight { get; set; }

        // prepend_common
        public string? prependCommon { get; set; }

        // remove_common_append_spdot
        public string? removeCommonAppendSpDot { get; set; }

		// remove_common_from_start
		public string? removeCommonFromStart { get; set; }

		// remove_s_append_spdot
		public string? removeSAppendSpDot { get; set; }

		// remove_s_from_end
		public string? removeSFromEnd { get; set; }

		// remove_spdot_from_end
		public string? removeSpDotFromEnd { get; set; }



		// C-tor
		public HostTokenVariations(string? baseToken_) {
            
            if (Utils.isEmptyElseTrim(ref baseToken_)) { return; }

			baseToken = baseToken_;

			populate();
		}

        public void populate() {

            // Populate the "minus words" types
            populateMinusWords();

            // The length of the string "common ".
            int commonSpaceLength = "common ".Length;

            // Does the baseToken end with "s"?
            bool endsWithS = baseToken!.EndsWith("s", StringComparison.CurrentCultureIgnoreCase);

            // Does the baseToken end with " sp." or " sp"?
            bool endsWithSpDot = baseToken.EndsWith(" sp.", StringComparison.CurrentCultureIgnoreCase) || 
				baseToken.EndsWith(" sp", StringComparison.CurrentCultureIgnoreCase);

            // Does the baseToken start with "common "?
			bool startsWithCommon = baseToken.StartsWith("common ", StringComparison.CurrentCultureIgnoreCase);


            //==========================================================================================================
            // Populate token variations (as appropriate)
            //==========================================================================================================

            // add_s_to_end
            if (!endsWithS && !endsWithSpDot) { addSToEnd = $"{baseToken}s"; }

		    // append_spdot
		    if (!endsWithSpDot) { appendSpDot = $"{baseToken} sp."; }

            // prepend_common
            if (!startsWithCommon) { prependCommon = $"common {baseToken}"; }

            // remove_common_append_spdot
            if (startsWithCommon && !endsWithSpDot) { 
                removeCommonAppendSpDot = $"{baseToken.Substring(commonSpaceLength)} sp.";
            }

		    // remove_common_from_start
		    if (startsWithCommon) { removeCommonFromStart = $"{baseToken.Substring(commonSpaceLength)}"; }

            // remove_s_from_end
            if (endsWithS) { 
                
                string lastSRemoved = baseToken.Substring(0, baseToken.Length - 1);

                removeSFromEnd = $"{lastSRemoved}";

                // remove_s_append_spdot
                if (!endsWithSpDot) { removeSAppendSpDot = $"{lastSRemoved} sp."; }
            }

            // remove_spdot_from_end
            if (endsWithSpDot) {
                if (baseToken.EndsWith(".")) {
                    // Remove " sp."
                    removeSpDotFromEnd = baseToken.Substring(0, baseToken.Length - 4);
                } else {
                    // Remove " sp"
                    removeSpDotFromEnd = baseToken.Substring(0, baseToken.Length - 3);
                }
            }
        }


        // Populate the "minus words" types
        public void populateMinusWords() {

			#region Remove words from the left side.
			
			string leftSide = new string(baseToken);

            int minusWordCounter = 1;

            while (minusWordCounter < 4) {

                int spaceIndex = leftSide.IndexOf(' ');

                if (spaceIndex < 0) { minusWordCounter = 999; continue; }

                leftSide = leftSide.Substring(spaceIndex);

                switch (minusWordCounter) {

                    case 1:
                        minusOneWordLeft = leftSide.Trim();
                        break;

                    case 2:
                        minusTwoWordsLeft = leftSide.Trim();
                        break;

                    case 3:
                        minusThreeWordsLeft = leftSide.Trim();
                        break;

                    default:
                        minusWordCounter = 999;
                        continue;
                }

                minusWordCounter++;
            }

            #endregion

            #region Remove words from the right side.

            string rightSide = new string(baseToken);

            minusWordCounter = 1;

            while (minusWordCounter < 4) {

                int spaceIndex = rightSide.LastIndexOf(' ');

                if (spaceIndex < 0) { minusWordCounter = 999; continue; }

                rightSide = rightSide.Substring(0, spaceIndex);

                switch (minusWordCounter) {

                    case 1:
                        minusOneWordRight = rightSide.Trim();
                        break;

                    case 2:
                        minusTwoWordsRight = rightSide.Trim();
                        break;

                    case 3:
                        minusThreeWordsRight = rightSide.Trim();
                        break;

                    default:
                        minusWordCounter = 999;
                        continue;
                }

                minusWordCounter++;
            }

			#endregion
		}


        

    }
}
