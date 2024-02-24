

namespace HostAnnotation.Utilities {

    // Methods related to user security, including password hashing (using BCrypt).
    // See https://codahale.com/how-to-safely-store-a-password/
    public class UserSecurity {

        // Hash a plain-text password using BCrypt.
        public static string hashPassword(string? password_) {

            if (Utils.isEmptyElseTrim(ref password_)) { throw SmartException.create("Invalid password (empty)"); }

            string salt = BCrypt.Net.BCrypt.GenerateSalt();
            if (string.IsNullOrEmpty(salt)) { throw SmartException.create("Unable to generate salt"); }

            // Hash the password using the salt.
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password_, salt);

            // Validate the hashed password against the original.
            if (!BCrypt.Net.BCrypt.Verify(password_, hashedPassword)) { throw SmartException.create("An error occurred hashing the password"); }
            
            return hashedPassword;
        }
        
        // Verify that the plain-text password is equal to the hashed version.
        public static bool verifyPassword(string hashedPassword_, string? password_) {

            if (Utils.isEmptyElseTrim(ref password_)) { throw SmartException.create("Invalid password (empty)"); }

            return BCrypt.Net.BCrypt.Verify(password_, hashedPassword_);
        }

    }
}