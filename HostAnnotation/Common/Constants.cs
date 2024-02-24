
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace HostAnnotation.Common {

    public partial class Constants {

        [GeneratedRegex(@"((?:aged)|(?:age)|(?:with))?[ ]?\d+(\.\d+)?([ -]?\d*(\.\d+)?)?[ -]((?:days)|(?:day)|(?:weeks)|(?:week)|(?:months)|(?:month)|(?:years)|(?:year))[ -]?(?:old)?", RegexOptions.IgnoreCase | RegexOptions.Compiled, "en-US")]
        public static partial Regex AgeTextRegEx();

        public static double DEFAULT_ANNOTATION_SCORE_THRESHOLD = 0.75;

        // Delimiters
        public static char[] DELIMITER_COMMA = [','];
        
    }
}
