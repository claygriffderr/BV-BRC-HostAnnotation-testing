
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;

using HostAnnotation.Common;
using HostAnnotation.DataProviders;
using HostAnnotation.Models;
using HostAnnotation.Utilities;
using System.Security.Policy;

namespace HostAnnotation.Services {

    public class PersonService : IPersonService {

        // The configuration properties.
        private readonly IConfiguration _configuration;

        // The data provider for Person objects.
        protected PersonDataProvider _dataProvider;


        // C-tor
        public PersonService(IConfiguration configuration_) {

            _configuration = configuration_;

            // Get and validate the database connection string.
            string? dbConnectionString = _configuration[Names.ConfigKey.DbConnectionString];
            if (string.IsNullOrEmpty(dbConnectionString)) { throw new Exception("Invalid database connection string"); }

            // Initialize the data provider
            _dataProvider = new PersonDataProvider(dbConnectionString);
        }



        // Try to authenticate the user with an email address and password.
        public bool authenticate(string email_, ref string? message_, string password_, ref Person? person_) {

            bool result = true;
            message_ = null;

            try {
                person_ = _dataProvider.get(email_);

                if (person_ == null) { throw SmartException.create("No matching account"); }
                if (string.IsNullOrEmpty(person_.passwordHash)) { throw new Exception("Invalid password hash"); }

                bool isValid = UserSecurity.verifyPassword(person_.passwordHash, password_);
                if (!isValid) { throw new Exception("Invalid password"); }

                message_ = "Valid email and password";
            }
            catch (Exception exc_) {
                person_ = null;
                result = false;
                message_ = exc_.Message;
            }

            return result;
        }


        // Create a new person.
        public bool createPerson(int createdBy_, string? email_, string? firstName_, string? lastName_, ref string? message_, Guid orgUID_,
            string? password_, Terms.api_role? role_, Terms.user_status? status_) {

            // TODO: validate all parameters
            if (Utils.isEmptyElseTrim(ref email_)) { message_ = "Invalid email"; return false; }
            if (Utils.isEmptyElseTrim(ref firstName_)) { message_ = "Invalid first name"; return false; }
            if (Utils.isEmptyElseTrim(ref lastName_)) { message_ = "Invalid last name"; return false; }
            if (Utils.isEmptyElseTrim(ref password_)) { message_ = "Invalid password"; return false; }

            if (status_ == null) { status_ = Terms.user_status.active; }

            string? passwordHash = UserSecurity.hashPassword(password_);

            if (!Utils.isEmptyElseTrim(ref password_)) { passwordHash = UserSecurity.hashPassword(password_); }

            return _dataProvider.createPerson(createdBy_, email_!, firstName_!, lastName_!, ref message_, orgUID_, passwordHash, role_!.Value, status_.Value);
        }


        // Get all people.
        public List<Person>? getPeople() {
            return _dataProvider.getAll();
        }


        // Get a person by ID.
        public Person? getPerson(int id_) {
            return _dataProvider.get(id_);
        }

    }
}
