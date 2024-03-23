
using HostAnnotation.Common;
using HostAnnotation.DataProviders;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;


namespace HostAnnotation.Services {


    public class AccountService : IAccountService {


        // The configuration properties.
        private readonly IConfiguration _configuration;

        // The data provider for Account Request objects.
        protected AccountDataProvider _dataProvider;


        // C-tor
        public AccountService(IConfiguration configuration_) {

            _configuration = configuration_;

            // Get and validate the database connection string.
            string? dbConnectionString = _configuration[Names.ConfigKey.DbConnectionString];
            if (string.IsNullOrEmpty(dbConnectionString)) { throw new Exception("Invalid database connection string"); }

            // Initialize the data provider
            _dataProvider = new AccountDataProvider(dbConnectionString);
        }


        // Generate a new token.
        public string generateNewToken() { return Guid.NewGuid().ToString().Replace("-", ""); }


        // Get a person's first name using a request type and their account request token.
        public string? getNameFromToken(Terms.account_request_type requestType_, string? token_) {
            return _dataProvider.getNameFromToken(requestType_, token_);
        }
      

        // Process a user's password reset request.
        public bool processPasswordReset(ref string? message_, string? password_, string? token_) {

            bool result = false;

            try {
                result = _dataProvider.processPasswordReset(password_, token_);

            } catch (Exception ex_) {
                message_ = ex_.Message;
            }

            return result;
        }

    }
}
