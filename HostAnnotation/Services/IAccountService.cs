using System;
using System.Collections.Generic;
using HostAnnotation.Common;
using HostAnnotation.Models;
using HostAnnotation.Utilities;

namespace HostAnnotation.Services {

    public interface IAccountService {

        // Generate a new token.
        string generateNewToken();

        // Process a user's password reset request.
        bool processPasswordReset(ref string? message_, string? password_, string? token_);

    }
}
