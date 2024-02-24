
using System;
using System.Collections.Generic;
using System.Text;
using HostAnnotation.Common;
using HostAnnotation.Utilities;

namespace HostAnnotation.Models {

    public class HostTaxonMatch : UsefulObject {

        [Useful("custom_name", false)]
        public string? customName { get; set; }

        [Useful("custom_name_class", false)]
        public string? customNameClass { get; set; }

        [Useful("custom_rank_name", false)]
        public string? customRankName { get; set; }

        [Useful("host_token", true)]
        public string? hostToken { get; set; }

        [Useful("is_one_of_many", true)]
        public bool isOneOfMany { get; set; }

        [Useful("match_type", true)]
        public Terms.taxon_match_type? matchType { get; set; }

        [Useful("name_class", true)]
        public string? nameClass { get; set; }

        [Useful("rank_name", true)]
        public string? rankName { get; set; }
        
        [Useful("taxon_name", true)]
        public string? taxonName { get; set; }

        [Useful("taxon_name_is_valid", true)]
        public bool taxonNameIsValid { get; set; }

        [Useful("taxonomy_db", true)]
        public Terms.taxonomy_db? taxonomyDB { get; set; }

        [Useful("taxonomy_id", true)]
        public int? taxonomyID { get; set; }

        [Useful("token_type", true)]
        public Terms.host_token_type? tokenType { get; set; }




        public static string generatePartialQuery() {

            var sql = new StringBuilder();
            sql.AppendLine("tnm.custom_name, ");
            sql.AppendLine("tnm.custom_name_class, ");
            sql.AppendLine("tnm.custom_rank_name, ");
            sql.AppendLine("ht.text AS host_token, ");
            sql.AppendLine("hhtm.is_one_of_many, ");
            sql.AppendLine("tnm.match_type, ");
            sql.AppendLine("tn.name_class, ");
            sql.AppendLine("tn.rank_name, ");
            sql.AppendLine("tn.taxonomy_db, ");
            sql.AppendLine("tn.taxonomy_id, ");
            sql.AppendLine("tn.name AS taxon_name, ");
            sql.AppendLine("tn.is_valid as taxon_name_is_valid, ");
            sql.AppendLine("hhtm.relation_type AS token_type ");

            sql.AppendLine("FROM v_hosts_host_token_map hhtm ");
            sql.AppendLine("JOIN host_token ht ON ht.id = hhtm.host_token_id ");
            sql.AppendLine("JOIN v_host_token_taxon_name_match tnm ON tnm.host_token_id = ht.id ");
            sql.AppendLine("JOIN v_taxon_name tn ON tn.id = tnm.taxon_name_id ");

            return sql.ToString();
        }

    }
}
