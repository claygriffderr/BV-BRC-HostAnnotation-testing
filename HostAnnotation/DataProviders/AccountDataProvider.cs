
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

using HostAnnotation.Common;
using HostAnnotation.Models;
using HostAnnotation.Utilities;
using static HostAnnotation.Common.Names;

namespace HostAnnotation.DataProviders {

    public class AccountDataProvider : DataProvider {


        // C-tor
        public AccountDataProvider(string dbConnectionString) : base(dbConnectionString) { }



        public string? createPasswordResetRequest(int requestedBy_) {





            // TODO
            return null;
        }


        // Get a person's name using their account request token.
        public string? getNameFromToken(Terms.account_request_type requestType_, string? token_) {
            
            if (Utils.isEmptyElseTrim(ref token_)) { return null; }

            string? strRequestType = Terms.enumString(requestType_);
            if (strRequestType == null) { throw SmartException.create("Unable to convert request type to a string"); }

            var parameters = new List<SqlParameter>() {
                Utils.createSqlParam("@token", SqlDbType.NVarChar, token_)
            };

            var sql = new StringBuilder();
            sql.AppendLine("SELECT TOP 1 p.first_name ");
            sql.AppendLine("FROM person p ");
            sql.AppendLine("JOIN (");
            sql.AppendLine("	SELECT TOP 1 ar.person_id AS person_id ");
            sql.AppendLine("	FROM v_account_request ar ");
            sql.AppendLine("	WHERE ar.token = @token ");
            sql.AppendLine($"	AND ar.request_type = '{strRequestType}' ");
            sql.AppendLine("	ORDER BY ar.requested_on DESC ");
            sql.AppendLine(") request ON person_id = p.id ");

            // Try to get the person's first name.
            string? firstName = DbQueryManager.getSingleValue<string>(_dbConnectionString, sql.ToString(), parameters);
            if (firstName == null) { throw SmartException.create("Unable to find an account for this token and request type"); }

            return firstName;
        }


        public bool processPasswordReset(string? password_, string? token_) {

            if (Utils.isEmptyElseTrim(ref password_)) { throw SmartException.create("Invalid password (empty)"); }
            if (Utils.isEmptyElseTrim(ref token_)) { throw SmartException.create("Invalid token (empty)"); }

            string? passwordHash = UserSecurity.hashPassword(password_);

            var parameters = new List<SqlParameter>() {
                Utils.createSqlParam("@token", SqlDbType.VarChar, token_)
            };

            var sql = new StringBuilder();
            sql.AppendLine("SELECT TOP 1 ");
            sql.AppendLine(AccountRequest.generatePartialQuery());
            sql.AppendLine("WHERE token = @token ");

            AccountRequest? request = null;

            UsefulObject.get<AccountRequest>(_dbConnectionString, parameters, sql.ToString(), ref request);
            if (request == null || request.id < 1) { throw SmartException.create("Unrecognized token"); }

            if (request.status != Terms.account_request_status.pending) {
                throw SmartException.create("You must register before updating your password");
            } else if (request.type != Terms.account_request_type.reset_password) {
                throw SmartException.create("Invalid request type");
            } else if (request.expiresOn != null && request.expiresOn.Value > DateTimeOffset.Now) {
                throw SmartException.create("This request has expired");
            }


            parameters = new List<SqlParameter>() {
                Utils.createSqlParam("@passwordHash", SqlDbType.NVarChar, passwordHash)
            };

            sql = new StringBuilder();
            sql.AppendLine("UPDATE person SET ");
            sql.AppendLine("password_hash = @passwordHash ");
            sql.AppendLine($"WHERE id = {request.personID} ");

            DbQueryManager.update(_dbConnectionString, sql.ToString(), parameters);
            return true;
        }



    }
}
