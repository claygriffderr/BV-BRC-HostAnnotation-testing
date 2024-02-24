
using System;
using System.Collections.Generic;
using HostAnnotation.Models;

using Terms = HostAnnotation.Common.Terms;

namespace HostAnnotation.Services {

    public interface IPersonService {

        // Try to authenticate the user with an email address and password.
        bool authenticate(string email_, ref string? message_, string password_, ref Person? person_);

        // Create a new person.
        public bool createPerson(int createdBy_, string? email_, string? firstName_, string? lastName_, ref string? message_, Guid orgUID_,
            string? password_, Terms.api_role? role_, Terms.user_status? status_);

        // Get all people.
        List<Person>? getPeople();

        // Get a person by email.
        //Person? getPerson(string email_);

        // Get a person by ID.
        Person? getPerson(int id_);



    }
}
