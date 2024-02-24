using System;
using System.Collections.Generic;
using HostAnnotation.Models;


namespace HostAnnotation.Services {

    public interface ITokenService {

        // Create an auth token.
        string? createToken(Person? person_);

        // Decode a JWT auth token.
        AuthToken? decodeToken(string token_);

    }
}
