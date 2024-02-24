
using System;

namespace HostAnnotation.Utilities {

    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
    public class UsefulAttribute : Attribute {

        public string columnName;
        public bool isRequired;

        public string? propertyName { get; set; }


        // C-tor
        public UsefulAttribute(string columnName_, bool isRequired_) {
            columnName = columnName_;
            isRequired = isRequired_;
        }

    }
}