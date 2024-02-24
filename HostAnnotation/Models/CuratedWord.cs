
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using HostAnnotation.Common;
using HostAnnotation.Utilities;

namespace HostAnnotation.Models {

    public class CuratedWord : UsefulObject {

        [Useful("alternate_text", false)]
        public string? alternateText { get; set; }

        [JsonIgnore]
        [Useful("alternate_text_filtered", false)]
        public string? alternateTextFiltered { get; set; }

        [JsonIgnore]
        [Useful("id", true)]
        public int id { get; set; }

        [Useful("is_valid", true)]
        public bool isValid { get; set; }

        [Useful("search_text", true)]
        public string? searchText { get; set; }

        [JsonIgnore]
        [Useful("search_text_filtered", true)]
        public string? searchTextFiltered { get; set; }

        [Useful("type", true)]
        public Terms.curation_type type { get; set; }

        [Useful("uid", true)]
        public Guid uid { get; set; }



        public static string generatePartialQuery() {

            var sql = new StringBuilder();
            sql.AppendLine("alternate_text, ");
            sql.AppendLine("alternate_text_filtered, ");
            sql.AppendLine("id, ");
            sql.AppendLine("is_valid, ");
            sql.AppendLine("search_text, ");
            sql.AppendLine("search_text_filtered, ");
            sql.AppendLine("[type], ");
            sql.AppendLine("[uid] ");

            sql.AppendLine("FROM v_curation ");

            return sql.ToString();
        }


    }
}
