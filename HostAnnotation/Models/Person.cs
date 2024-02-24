
using System.Text;
using System.Text.Json.Serialization;

using HostAnnotation.Utilities;

using Terms = HostAnnotation.Common.Terms;

namespace HostAnnotation.Models {

    public class Person : UsefulObject {
        
        [Useful("email", true)]
        public string? email { get; set; }

        [Useful("first_name", false)]
        public string? firstName { get; set; }

        [JsonIgnore]
        [Useful("id", true)]
        public int id { get; set; }
        
        [Useful("last_name", false)]
        public string? lastName { get; set; }

        [JsonIgnore]
        [Useful("organization_id", false)]
        public int? organizationID { get; set; }

        [Useful("organization_uid", false)]
        public Guid? organizationUID { get; set; }

        [JsonIgnore]
        [Useful("password_hash", false)]
        public string? passwordHash { get; set; }

        [Useful("role", true)]
        public Terms.api_role role { get; set; }

        [Useful("status", true)]
        public Terms.user_status? status { get; set; }

        [Useful("uid", true)]
        public Guid? uid { get; set; }




        public static string generatePartialQuery() {

            StringBuilder sql = new();
            sql.AppendLine("email, ");
            sql.AppendLine("first_name, ");
            sql.AppendLine("id, ");
            sql.AppendLine("last_name, ");
            sql.AppendLine("organization_id, ");
            sql.AppendLine("organization_uid, ");
            sql.AppendLine("password_hash, ");
            sql.AppendLine("role, ");
            sql.AppendLine("status, ");
            sql.AppendLine("uid ");

            sql.AppendLine("FROM v_person ");

            return sql.ToString();
        }


    }
}
