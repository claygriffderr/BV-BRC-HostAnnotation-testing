
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;


namespace HostAnnotation.Utilities {

    public class Utils {

        // Commonly-used delimiters
        public static class Delimiters {
            public static char[] Ampersand = { '&' };
            public static char[] Colon = { ':' };
            public static char[] Comma = { ',' };
            public static char[] EOL = { '\n' };
            public static char[] Equal = { '=' };
            public static char[] Hyphen = { '-' };
            public static char[] Period = { '.' };
            public static char[] Semicolon = { ';' };
            public static char[] Space = { ' ' };
            public static char[] Tab = { '\t' };
            public static char[] Underscore = { '_' };
        }

        // Use input string to calculate MD5 hash
        // Courtesy of https://stackoverflow.com/questions/11454004/calculate-a-md5-hash-from-a-string
        public static string? CreateMD5(string input_) {

            using (System.Security.Cryptography.MD5 md5 = System.Security.Cryptography.MD5.Create()) {
                byte[] inputBytes = Encoding.ASCII.GetBytes(input_);
                byte[] hashBytes = md5.ComputeHash(inputBytes);

                // Convert the byte array to hexadecimal string
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < hashBytes.Length; i++) {
                    sb.Append(hashBytes[i].ToString("X2"));
                }

                return sb.ToString();
            }
        }


        // A convenience method that creates a SqlParameter. If the value is a non-null string, it will be 
        // automatically formatted for SQL.
        public static SqlParameter createSqlParam(string paramName_, SqlDbType dbType_, object? value_) {

            // Replace null with a DBNull. Note that if a null isn't replaced with DBNull, the parameter doesn't get added to the query!
            if (value_ == null) {
                value_ = DBNull.Value;

            } else {

                Type valueType = value_.GetType();

                // Handle any necessary implicit conversions.
                if (valueType.Equals(typeof(bool)) && (dbType_ == SqlDbType.Bit || dbType_ == SqlDbType.Int)) {
                    value_ = (bool)value_ == true ? 1 : 0;

                } else if (valueType.Equals(typeof(Enum))) {
                    value_ = Enum.GetName(valueType, value_);
                }
            }

            // Validate the parameter name.
            if (isEmptyElseTrim(ref paramName_!)) { throw SmartException.create("Invalid parameter name"); }
            if (!paramName_.StartsWith("@")) { paramName_ = string.Format("@{0}", paramName_); }

            return new SqlParameter(paramName_, dbType_) { Value = value_ };
        }

        // A cleaner-looking way to add a SQL Parameter to a collection (cleaner than "cmd.Parameters.Add(createSqlParam(...").
        public static void createSqlParam(string paramName_, ref List<SqlParameter> params_, SqlDbType dbType_, object? value_) {
            params_.Add(createSqlParam(paramName_, dbType_, value_));
        }

        // A cleaner-looking way to add a SQL (output) Parameter to a collection. 
        public static void createSqlOutputParam(string paramName_, ref List<SqlParameter> params_, SqlDbType dbType_,
            object? initialValue_ = null, int? size_ = null) {

            SqlParameter parameter = createSqlParam(paramName_, dbType_, initialValue_);
            parameter.Direction = ParameterDirection.Output;

            if (size_ != null) { parameter.Size = size_.Value; }

            params_.Add(parameter);
        }

        // Create an output SqlParameter.
        public static SqlParameter createSqlOutputParam(string paramName_, SqlDbType dbType_, ValueType? initialValue_ = null, int? size_ = null) {

            SqlParameter parameter = createSqlParam(paramName_, dbType_, initialValue_);
            parameter.Direction = ParameterDirection.Output;

            if (size_ != null) { parameter.Size = size_.Value; }

            return parameter;
        }

        public static string DecoderMatchEvaluator(Match m) {
            return ((char)int.Parse(m.Groups["Value"].Value, System.Globalization.NumberStyles.HexNumber)).ToString();
        }

        public static string? DecodeEncodedNonAsciiCharacters(string value) {
            if (value == null) { return null; }
            return Regex.Replace(value, @"\\u(?<Value>[a-zA-Z0-9]{4})", DecoderMatchEvaluator);
        }


        // Courtesy of Adam Sills on http://stackoverflow.com/questions/1615559/converting-unicode-strings-to-escaped-ascii-string
        public static string? EncodeNonAsciiCharacters(string value) {

            if (value == null) { return value; }

            StringBuilder sb = new();
            foreach (char c in value) {
                if (c > 127) {
                    // This character is too big for ASCII
                    string encodedValue = "\\u" + ((int)c).ToString("x4");
                    sb.Append(encodedValue);
                } else {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }


        // Trim and URL-decode this text parameter.
        public static string? decodeParameter(string? value_) {

            string? decodedParameter = value_;
            if (isEmptyElseTrim(ref decodedParameter)) {
                decodedParameter = null;
            } else {
                decodedParameter = HttpUtility.UrlDecode(decodedParameter);
            }

            return decodedParameter;
        }



        #region Methods that return "NULL" for a null value, or formatted for SQL and surrounded with single quotes


        public static string? formatAsSqlOrNull(DateTimeOffset? value_) {

            string text = "NULL";

            if (value_ != null) { text = string.Format("'{0}'", value_.Value.ToString()); }

            return text;
        }

        public static string? formatAsSqlOrNull(int? value_) {

            string text = "NULL";

            if (value_ != null) { text = value_.Value.ToString(); }

            return text;
        }

        public static string? formatAsSqlOrNull(string? text_) {

            string? text = text_;
            if (isEmptyElseTrim(ref text)) {
                text = "NULL";
            } else {
                text = string.Format("'{0}'", formatForSQL(text));
            }

            return text;
        }


        #endregion


        // Format text to be valid for SQL
        public static string? formatForSQL(string? text_) {

            if (string.IsNullOrEmpty(text_)) { return ""; }

            string result = text_;
            result = result.Replace("--", " ");
            result = result.Replace("'", "''");
            result = result.Replace("\"", @"""");

            return result;
        }

        // Format a value for SQL when the type is known.
        public static string? formatForSQL(Type type_, string value_) {

            string sqlValue;

            if (string.IsNullOrEmpty(value_)) {

                sqlValue = "NULL";

            } else {

                Type t = Nullable.GetUnderlyingType(type_) ?? type_;
                object? valueAsObject = null;

                if (t.Equals(typeof(DateTimeOffset))) {
                    DateTimeOffset dto;
                    if (DateTimeOffset.TryParse(value_, out dto)) { valueAsObject = dto; }
                } else {
                    valueAsObject = Convert.ChangeType(value_, t);
                }

                // TODO: what about enums?

                if (t.Equals(typeof(bool))) {

                    // We persist boolean values in the db as 0 or 1.
                    sqlValue = (bool)valueAsObject! ? "1" : "0";

                } else {
                    sqlValue = $"'{formatForSQL(valueAsObject!.ToString())}'";
                }
            }

            return sqlValue;
        }


        // Note: this will be commonly used to automatically convert a display label to a key.
        public static string? formatToAlphanumericAndUnderscore(string? text_) {

            string? result = text_;
            if (isEmptyElseTrim(ref result)) {
                result = "";
            } else {
                result = Regex.Replace(text_!, "[^0-9a-zA-Z]", "_").ToLower();

                // Replace multiple adjacent underscores with one underscore.
                result = Regex.Replace(result, "(_)+", "_");
            }

            return result;
        }



        // Try to return the value of the specified parameter without having to worry whether it's null or not.
        public static bool getSqlOutputParameter(SqlCommand command_, string parameterName_, ref int result_) {

            if (command_ == null || command_.Parameters == null) { throw SmartException.create("Invalid SQL Command"); }
            if (string.IsNullOrEmpty(parameterName_) || !parameterName_.StartsWith("@")) { throw SmartException.create("Invalid parameter name"); }

            object testResult = command_.Parameters[parameterName_].Value;
            if (testResult == null || testResult.GetType().Equals(typeof(DBNull))) {
                result_ = -1;
                return false;
            }

            result_ = Convert.ToInt32(testResult);
            return true;
        }

        // Try to return the value of the specified parameter without having to worry whether it's null or not.
        public static bool getSqlOutputParameter(SqlCommand command_, string parameterName_, ref Guid? result_) {

            if (command_ == null || command_.Parameters == null) { throw SmartException.create("Invalid SQL Command"); }
            if (string.IsNullOrEmpty(parameterName_) || !parameterName_.StartsWith("@")) { throw SmartException.create("Invalid parameter name"); }

            object testResult = command_.Parameters[parameterName_].Value;
            if (testResult == null || testResult.GetType().Equals(typeof(DBNull)) || !testResult.GetType().Equals(typeof(Guid))) {
                result_ = null;
                return false;
            } else {
                result_ = (Guid)testResult;
            }

            return true;
        }

        // Try to return the value of the specified parameter without having to worry whether it's null or not.
        public static bool getSqlOutputParameter(SqlCommand command_, string parameterName_, ref string? result_) {

            if (command_ == null || command_.Parameters == null) { throw SmartException.create("Invalid SQL Command"); }
            if (string.IsNullOrEmpty(parameterName_) || !parameterName_.StartsWith("@")) { throw SmartException.create("Invalid parameter name"); }

            object testResult = command_.Parameters[parameterName_].Value;
            if (testResult == null || testResult.GetType().Equals(typeof(DBNull))) {
                result_ = null;
                return false;
            } else {
                result_ = Convert.ToString(testResult);
            }

            return true;
        }


        // If the string is null or empty, return true. Otherwise, trim it and return true.
        public static bool isEmptyElseTrim(ref string? testString_) {

            if (testString_ == null) { return true; }

            testString_ = testString_.Trim();
            if (testString_.Length < 1) { return true; }

            return false;
        }

        // Is this nullable integer non-null and a positive integer (including zero)?
        public static bool isNonNegative(int? number_) {
            return (number_ != null && number_.Value > -1);
        }

        // Is the GUID null or empty?
        public static bool isNullOrEmpty(Guid? guid_) {
            return (guid_ == null || guid_.Equals(Guid.Empty));
        }

        // An improved version of String.IsNullOrEmpty() (this trims before checking whether it's empty).
        public static bool isNullOrEmpty(string testString_) {

            if (testString_ == null) { return true; }

            string testString = testString_.Trim();
            if (testString.Length < 1) { return true; }

            return false;
        }

        // Is the nullable integer non-null with a value greater than zero?
        public static bool isPositive(int? value_) {
            if (value_ == null || value_.Value < 1) {
                return false;
            } else {
                return true;
            }
        }

        // TODO: test!
        public static bool isValidEmail(string? email_) {

            string? email = email_;
            if (isEmptyElseTrim(ref email) || email!.Length > 254) { return false; }

            // https://regular-expressions.mobi/email.html?wlr=1
            // ("The maximum length of an email address that can be handled by SMTP is 254 characters")
            string pattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";

            // Previous version: "^(([^<>()\\[\\]\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\.,;:\\s@\"]+)*)|(\".+\"))@(([^<>()[\\]\\.,;:\\s@\"]+\\.)+[^<>()[\\]\\.,;:\\s@\"]{2,})";

            return Regex.IsMatch(email, pattern);
        }





    }
}