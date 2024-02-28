using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using HostAnnotation.Common;
using HostAnnotation.Utilities;

namespace HostAnnotation.Models {

    public class AccountRequest : UsefulObject {

        [Useful("expires_on", false)]
        public DateTimeOffset? expiresOn { get; set; }

        [Useful("id", true)]
        public int id { get; set; }

        [Useful("person_id", true)]
        public int personID { get; set; }

        [Useful("requested_by", true)]
        public int requestedBy { get; set; }

        [Useful("requested_on", false)]
        public DateTimeOffset? requestedOn { get; set; }

        [Useful("status", false)]
        public Terms.account_request_status status { get; set; }

        [Useful("token", false)]
        public string? token { get; set; }

        [Useful("request_type", false)]
        public Terms.account_request_type type { get; set; }

        


        public static string generatePartialQuery() {

            var sql = new StringBuilder();
            sql.AppendLine("expires_on, ");
            sql.AppendLine("id, ");
            sql.AppendLine("person_id, ");
            sql.AppendLine("requested_by, ");
            sql.AppendLine("requested_on, ");
            sql.AppendLine("request_type, ");
            sql.AppendLine("[status], ");
            sql.AppendLine("token ");

            sql.AppendLine("FROM v_account_request ");

            return sql.ToString();
        }

    }
}
