
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using HostAnnotation.Common;
using HostAnnotation.Utilities;

namespace HostAnnotation.Models {

    public class AnnotatedHost : UsefulObject {

        [Useful("algorithm_id", false)]
        public int? algorithmID { get; set; }

        [Useful("taxon_class_cn", false)]
        public string? classCommonName { get; set; }

        [Useful("taxon_class_sn", false)]
        public string? classScientificName { get; set; }

        [Useful("common_name", false)]
        public string? commonName { get; set; }

        [Useful("host_id", true)]
        public int hostID { get; set; }

        [Useful("host_text", true)]
        public string? hostText { get; set; }

        [Useful("id", true)]
        public int id { get; set; }

        [Useful("sci_name_is_avian", true)]
        public bool isAvian { get; set; }

        [Useful("rank_name", true)]
        public string? rankName { get; set; }

        [Useful("scientific_name", true)]
        public string? scientificName { get; set; }
 
        [Useful("sci_name_score", true)]
        public double score { get; set; }

        [Useful("status", false)]
        public string? status { get; set; }

        [Useful("status_details", false)]
        public string? statusDetails { get; set; }

        [Useful("com_name_synonyms", false)]
        public string? synonyms { get; set; }

        [Useful("sci_name_taxon_name_match_id", true)]
        public int? taxonNameMatchID { get; set; }

        [Useful("sci_name_taxonomy_db", true)]
        public Terms.taxonomy_db? taxonomyDB { get; set; }

        [Useful("sci_name_taxonomy_id", true)]
        public int? taxonomyID { get; set; }

        

        
        public static string generatePartialQuery() {

            var sql = new StringBuilder();
            sql.AppendLine("algorithm_id, ");
            sql.AppendLine("common_name, ");
            sql.AppendLine("com_name_synonyms, ");
            sql.AppendLine("[host_id], ");
            sql.AppendLine("host_text, ");
            sql.AppendLine("id, ");
            sql.AppendLine("rank_name, ");
            sql.AppendLine("scientific_name, ");
            sql.AppendLine("sci_name_is_avian, ");
            sql.AppendLine("sci_name_score, ");
            sql.AppendLine("sci_name_taxonomy_db, ");
            sql.AppendLine("sci_name_taxonomy_id, ");
            sql.AppendLine("sci_name_taxon_name_match_id, ");
            sql.AppendLine("status, ");
            sql.AppendLine("status_details, ");
            sql.AppendLine("taxon_class_cn, ");
            sql.AppendLine("taxon_class_sn ");

            sql.AppendLine("FROM v_annotated_host ");

            return sql.ToString();
        }





    }
}
