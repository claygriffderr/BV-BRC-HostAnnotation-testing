
using System.Data;
using System.Data.SqlClient;
using System.Text;

using HostAnnotation.Common;
using HostAnnotation.Models;
using HostAnnotation.Utilities;

namespace HostAnnotation.DataProviders {

    public class PersonDataProvider : DataProvider {

        // C-tor
        public PersonDataProvider(string dbConnectionString) : base(dbConnectionString) { }


        public bool createPerson(int createdBy_, string email_, string firstName_, string lastName_, ref string? message_, 
            Guid orgUID_, string passwordHash_, Terms.api_role role_, Terms.user_status status_) {

            bool result = false;

            var parameters = new List<SqlParameter>() {
                Utils.createSqlParam("@createdBy", SqlDbType.Int, createdBy_),
                Utils.createSqlParam("@email", SqlDbType.VarChar, email_),
                Utils.createSqlParam("@firstName", SqlDbType.NVarChar, firstName_),
                Utils.createSqlOutputParam("@id", SqlDbType.Int),
                Utils.createSqlParam("@lastName", SqlDbType.NVarChar, lastName_),
                Utils.createSqlParam("@orgUID", SqlDbType.UniqueIdentifier, orgUID_.ToString()),
                Utils.createSqlParam("@passwordHash", SqlDbType.NVarChar, passwordHash_),
                Utils.createSqlParam("@role", SqlDbType.VarChar, Terms.enumString(role_)),
                Utils.createSqlParam("@status", SqlDbType.VarChar, Terms.enumString(status_!))
            };

            try {
                // TODO: is the id output parameter in the parameters below?
                DbQueryManager.runStoredProcedure(_dbConnectionString, "dbo.createPerson", parameters);
                result = true;
            }
            catch (Exception e_) {
                message_ = e_.Message;
            }

            return result;
        }


        public List<Person>? getAll() {

            List<Person>? people = null;

            var sql = new StringBuilder();
            sql.AppendLine("SELECT ");
            sql.AppendLine(Person.generatePartialQuery());
            sql.AppendFormat("ORDER BY last_name, first_name ");

            UsefulObject.get<Person>(_dbConnectionString, sql.ToString(), ref people);

            return people;
        }

        // Get a person by email address.
        public Person? get(string email_) {

            Person? person = null;

            var sql = new StringBuilder();
            sql.AppendLine("SELECT TOP 1 ");
            sql.AppendLine(Person.generatePartialQuery());
            sql.AppendFormat($"WHERE email = '{email_}' ");

            UsefulObject.get<Person>(_dbConnectionString, sql.ToString(), ref person);

            return person;
        }

        // Get a person by ID.
        public Person? get(int id_) {

            Person? person = null;

            var sql = new StringBuilder();
            sql.AppendLine("SELECT TOP 1 ");
            sql.AppendLine(Person.generatePartialQuery());
            sql.AppendFormat($"WHERE id = {id_} ");

            UsefulObject.get<Person>(_dbConnectionString, sql.ToString(), ref person);

            return person;
        }


    }
}
