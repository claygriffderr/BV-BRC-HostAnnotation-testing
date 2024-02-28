
using System;
using System.Collections.Generic;
using System.Text;

using HostAnnotation.Common;
using HostAnnotation.Utilities;

namespace HostAnnotation.Models {

    public class TaxonName : UsefulObject {

        [Useful("filtered_name", true)]
        public string? filteredName { get; set; }

        [Useful("id", true)]
        public int id { get; set; }

        [Useful("is_valid", true)]
        public bool isValid { get; set; }

        [Useful("name", true)]
        public string? name { get; set; }

        [Useful("name_class", true)]
        public Terms.ncbi_name_class nameClass { get; set; }

        [Useful("rank_name", true)]
        public string? rankName { get; set; }

        [Useful("taxonomy_db", true)]
        public Terms.taxonomy_db taxonomyDB { get; set; }

        [Useful("taxonomy_id", true)]
        public int taxonomyID { get; set; }



        public static string generatePartialQuery() {

            var sql = new StringBuilder();

            sql.AppendLine("filtered_name, ");
            sql.AppendLine("id, ");
            sql.AppendLine("is_valid, ");
            sql.AppendLine("[name], ");
            sql.AppendLine("name_class, ");
            sql.AppendLine("rank_name, ");
            sql.AppendLine("taxonomy_db, ");
            sql.AppendLine("taxonomy_id ");

            sql.AppendLine("FROM v_taxon_name ");

            return sql.ToString();
        }

    }
}
