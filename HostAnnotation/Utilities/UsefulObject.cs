
using System.Data;
using System.Data.SqlClient;
using System.Reflection;

namespace HostAnnotation.Utilities {

    // A base class for objects that can be easily created and populated from SQL.
    public class UsefulObject : IUsefulObject {

        
        // This allows object properties to be accessed by name. Example: MyObject["label"] = "This is the label"
        public object? this[string propertyName_] {

            get {
                if (Utils.isEmptyElseTrim(ref propertyName_!)) { throw SmartException.create("Invalid property name (empty)"); }

                PropertyInfo? property = GetType().GetProperty(propertyName_);
                if (property == null) { throw SmartException.create($"Unrecognized property {propertyName_}"); }

                return property.GetValue(this, null);
            }

            set {

                // Validate the property name.
                if (Utils.isEmptyElseTrim(ref propertyName_!)) { throw SmartException.create("Invalid property name (empty)"); }

                // Get and validate the property with this name.
                PropertyInfo? property = GetType().GetProperty(propertyName_);
                if (property == null) { throw SmartException.create($"Unrecognized property {propertyName_}"); }

                // The value after conversion (if conversion is necessary).
                object? convertedValue;

                Type propertyType = property.PropertyType;

                // If the property type is a Nullable object, we need to do this to determine its type.
                if (propertyType.IsGenericType && propertyType.GetGenericTypeDefinition() == typeof(Nullable<>)) {
                    Type[] genericArguments = propertyType.GetGenericArguments();
                    if (genericArguments != null && genericArguments.Length > 0 && genericArguments[0] != null) {
                        propertyType = genericArguments[0];
                    }
                }

                if (value == null || value.GetType().Equals(typeof(DBNull))) {

                    // Provide a default value for null value types.
                    convertedValue = propertyType.IsValueType ? getDefaultValue(propertyType) : null;
                   
                } else if (propertyType.IsEnum) {

                    // Cast the value as a string and then try to parse as the appropriate enum.
                    convertedValue = Enum.Parse(propertyType, (string)value);

                } else if (propertyType.Equals(typeof(bool)) && value.GetType().Equals(typeof(int))) {

                    // If the value for a bool is provided as an integer, convert it.
                    convertedValue = (int)value == 1;

                } else {
                    convertedValue = value;
                }

                // Set the property's value using the converted value.
                property.SetValue(this, convertedValue);
            }
        }


        // Create a useful object of the specified type using the type's UsefulAttributes and a data row.
        public static TUsefulObject? create<TUsefulObject>(List<UsefulAttribute> attributes_, DataRow row_) 
            where TUsefulObject : IUsefulObject, new() {

            // How many properties were updated?
            int propertyUpdates = 0;

            // Create an instance of the generic type.
            TUsefulObject? usefulObject = Activator.CreateInstance<TUsefulObject>();

            foreach (UsefulAttribute attribute in attributes_) {

                object? columnValue = null;

                try {
                    // Try to get this column's value from the row.
                    columnValue = row_[attribute.columnName];
                }
                catch (Exception) {

                    // If this is a required field and it's missing from the row, raise an exception.
                    if (attribute.isRequired) { throw SmartException.create($"Column {attribute.columnName} was not found"); }

                    continue;
                }

                // Replace DBNull with null.
                if (columnValue != null && columnValue.GetType().Equals(typeof(DBNull))) { columnValue = null; };

                // If this is a required field and it's empty, raise an exception.
                if (attribute.isRequired && columnValue == null) {
                    throw SmartException.create($"Invalid value for column {attribute.columnName}");
                }

                // Set the Useful Object property with this value.
                usefulObject[attribute.propertyName!] = columnValue!;

                // Increment the number of updated properties.
                propertyUpdates += 1;
            }

            if (propertyUpdates < 1) {
                usefulObject = default;
            } else {
                usefulObject.process();
            }
            
            return usefulObject;
        }


        // Create a useful object of the specified type using the type's UsefulAttributes and a data row.
        public static TUsefulObject? create<TUsefulObject>(List<UsefulAttribute> attributes_, SqlDataReader reader_) 
            where TUsefulObject : IUsefulObject, new() {

            // Keep track of how many properties are updated.
            int propertyUpdates = 0;

            // Create an instance of the generic type.
            TUsefulObject? usefulObject = Activator.CreateInstance<TUsefulObject>();

            foreach (UsefulAttribute attribute in attributes_) {

                object? columnValue = null;

                try {
                    // Try to get this column's value from the row.
                    columnValue = reader_[attribute.columnName];
                }
                catch (Exception) {

                    // If this is a required field and it's missing from the row, raise an exception.
                    if (attribute.isRequired) { throw SmartException.create($"Column {attribute.columnName} was not found"); }
                }

                // Replace DBNull with null.
                if (columnValue != null && columnValue.GetType().Equals(typeof(DBNull))) { columnValue = null; };

                // If this is a required field and it's empty, raise an exception.
                if (attribute.isRequired && columnValue == null) {
                    throw SmartException.create($"Invalid value for column {attribute.columnName}");
                }

                // Set the Useful Object property with this value.
                usefulObject[attribute.propertyName!] = columnValue!;

                // Increment the number of updated properties.
                propertyUpdates += 1;
            }

            if (propertyUpdates < 1) {
                usefulObject = default;
            } else {
                usefulObject.process();
            }

            return usefulObject;
        }


        // Execute the SQL query (using query parameters) and use the results to populate a collection of (useful) objects.
        public static void get<TUsefulObject>(string dbConnectionString_, List<SqlParameter> parameters_, string query_, 
            ref List<TUsefulObject>? results_, int? commandTimeout_ = null) 
            where TUsefulObject : IUsefulObject, new() {

            // Get any Useful Attributes defined by the generic type.
            List<UsefulAttribute>? attributes = getAttributes<TUsefulObject?>();
            if (attributes == null || attributes.Count < 1) { throw SmartException.create("Invalid Useful Attributes"); }

            // Instantiate the collection of objects to be returned.
            results_ = new List<TUsefulObject>();

            using (SqlConnection dbConnection = new SqlConnection(dbConnectionString_))
            using (SqlCommand command = new SqlCommand(query_, dbConnection)) {

                dbConnection.Open();

                // Add any SQL parameters that were provided.
                if (parameters_ != null && parameters_.Count > 0) {
                    foreach (SqlParameter parameter in parameters_) { command.Parameters.Add(parameter); }
                }

                // If a non-negative (and non-null) command timeout parameter was provided, update the command.
                if (Utils.isNonNegative(commandTimeout_)) { command.CommandTimeout = commandTimeout_!.Value; }
                    
                using (SqlDataReader reader = command.ExecuteReader(CommandBehavior.Default)) {

                    while (reader.Read()) {

                        // Create the UsefulObject using the UsefulAttributes and data reader.
                        TUsefulObject? usefulObject = create<TUsefulObject>(attributes, reader);

                        // If the object is valid, add it to the collection of results.
                        if (usefulObject != null) { results_.Add(usefulObject); }
                    }
                }
            }
        }


        // Execute the SQL query (using query parameters) and use the results to populate the (useful) object.
        public static void get<TUsefulObject>(string dbConnectionString_, List<SqlParameter> parameters_, string query_, ref TUsefulObject? result_) 
            where TUsefulObject : IUsefulObject, new() {

            // Get any Useful Attributes defined by the generic type.
            List<UsefulAttribute>? attributes = getAttributes<TUsefulObject?>();
            if (attributes == null || attributes.Count < 1) { throw SmartException.create("Invalid Useful Attributes"); }

            // Instantiate the collection of objects to be returned.
            result_ = default;

            using (SqlConnection dbConnection = new SqlConnection(dbConnectionString_))
            using (SqlCommand command = new SqlCommand(query_, dbConnection)) {

                dbConnection.Open();

                // Add any SQL parameters that were provided.
                if (parameters_ != null && parameters_.Count > 0) {
                    foreach (SqlParameter parameter in parameters_) { command.Parameters.Add(parameter); }
                }

                using (SqlDataReader reader = command.ExecuteReader(CommandBehavior.SingleRow)) {
                    if (reader.Read()) { result_ = create<TUsefulObject>(attributes, reader); }
                } 
            }
        }


        // Execute the SQL query and use the results to populate a collection of (useful) objects.
        public static void get<TUsefulObject>(string dbConnectionString_, string query_, ref List<TUsefulObject>? usefulObjects_) 
            where TUsefulObject : IUsefulObject, new() {

            if (string.IsNullOrEmpty(dbConnectionString_)) { throw SmartException.create("Invalid db connection string"); }
            if (string.IsNullOrEmpty(query_)) { throw SmartException.create("Invalid query"); }

            // Get any Useful Attributes defined by the generic type.
            List<UsefulAttribute>? attributes = getAttributes<TUsefulObject?>();
            if (attributes == null || attributes.Count < 1) { throw SmartException.create("Invalid Useful Attributes"); }

            // Instantiate the collection of objects to be returned.
            usefulObjects_ = new List<TUsefulObject>();
            
            using (var dbConnection = new SqlConnection(dbConnectionString_)) {

                dbConnection.Open();

                using (var dataAdaptor = new SqlDataAdapter(query_, dbConnection)) {

                    var dataTable = new DataTable();

                    dataAdaptor.Fill(dataTable);

                    // Validate the data table and its rows
                    if (dataTable == null || dataTable.Rows == null || dataTable.Rows.Count < 1) { return; }

                    // Iterate over all rows in the DataTable.
                    foreach (DataRow dataRow in dataTable.Rows) {

                        if (dataRow == null) { continue; }

                        // Create the UsefulObject using the UsefulAttributes and data row.
                        TUsefulObject? usefulObject = create<TUsefulObject>(attributes, dataRow);

                        // If the object is valid, add it to the collection of results.
                        if (usefulObject != null) { usefulObjects_.Add(usefulObject); }
                    }
                    
                }
            }
        }


        // Execute the SQL query and use the results to populate the (useful) object.
        public static void get<TUsefulObject>(string dbConnectionString_, string query_, ref TUsefulObject? usefulObject_) 
            where TUsefulObject : IUsefulObject, new() {

            if (string.IsNullOrEmpty(dbConnectionString_)) { throw SmartException.create("Invalid db connection string"); }
            if (string.IsNullOrEmpty(query_)) { throw SmartException.create("Invalid query"); }

            usefulObject_ = default;

            // Get any Useful Attributes defined by the generic type.
            List<UsefulAttribute>? attributes = getAttributes<TUsefulObject?>();
            if (attributes == null || attributes.Count < 1) { throw SmartException.create("Invalid Useful Attributes"); }
            
            using (SqlConnection dbConnection = new(dbConnectionString_))
            using (SqlDataAdapter dataAdaptor = new SqlDataAdapter(query_, dbConnection)) {

                dbConnection.Open();

                DataTable dataTable = new DataTable();
                dataAdaptor.Fill(dataTable);
                    
                // Validate the data table and its rows
                if (dataTable == null || dataTable.Rows.Count < 1) { return; }

                DataRow dataRow = dataTable.Rows[0];
                if (dataRow == null) { return; }

                // Create and populate the object using UsefulAttributes and the data row.
                usefulObject_ = create<TUsefulObject>(attributes, dataRow);   
            }
        }


        // Use reflection on the generic type to find "UsefulAttribute" custom attributes assigned to properties.
        protected static List<UsefulAttribute>? getAttributes<TUsefulObject>() {

            var attributes = new List<UsefulAttribute>();

            Type type = typeof(TUsefulObject?);

            foreach (PropertyInfo propertyInfo in type.GetProperties()) {

                // Does this property have a UsefulAttribute?
                UsefulAttribute? usefulAttribute = propertyInfo.GetCustomAttribute<UsefulAttribute>(true);
                if (usefulAttribute == null) { continue; }

                // Set the property name.
                usefulAttribute.propertyName = propertyInfo.Name;

                // Update the results.
                attributes.Add(usefulAttribute);
            }

            return attributes;
        }


        // Get the default value for common data types.
        protected static object? getDefaultValue(Type type_) {

            object? value;
            
            switch (type_.Name) {

                case "Boolean":
                    value = false;
                    break;

                case "DateTime":
                    value = null; //DateTime.MinValue;
                    break;

                case "DateTimeOffset":
                    value = null; //DateTimeOffset.MinValue;
                    break;

                case "Double":
                    value = 0.0d;
                    break;

                case "Single":
                    value = 0.0f;
                    break;

                case "Int32":
                    value = -1;
                    break;

                case "Int64":
                    value = -1;
                    break;

                default:
                    value = null;
                    break;
            }

            return value;
        }


        // Populate the result objects using the DataTable provided.
        public static void populate<TUsefulObject>(DataTable dataTable_, ref List<TUsefulObject>? usefulObjects_) 
            where TUsefulObject : IUsefulObject, new() {

            // Default the results to null.
            usefulObjects_ = null;

            // Validate the data table and its rows
            if (dataTable_ == null || dataTable_.Rows.Count < 1) { return; }

            // Get any Useful Attributes defined by the generic type.
            List<UsefulAttribute>? attributes = getAttributes<TUsefulObject?>();
            if (attributes == null || attributes.Count < 1) { throw SmartException.create("Invalid Useful Attributes"); }

            // Instantiate the collection of results.
            usefulObjects_ = new List<TUsefulObject>();

            foreach (DataRow dataRow in dataTable_.Rows) {

                if (dataRow == null) { throw SmartException.create("Invalid row (null)"); }

                // Create and populate the object using UsefulAttributes and the data row.
                TUsefulObject? usefulObject = create<TUsefulObject>(attributes, dataRow);

                // If the object is valid, add it to the collection of results.
                if (usefulObject != null) { usefulObjects_.Add(usefulObject); }
            }
        }


        // Populate the result object using the DataTable provided.
        public static void populate<TUsefulObject>(DataTable dataTable_, ref TUsefulObject? usefulObject_) where TUsefulObject : IUsefulObject, new() {

            // Default the result.
            usefulObject_ = default;

            // Validate the data table and its rows
            if (dataTable_ == null || dataTable_.Rows.Count < 1) { return; }

            DataRow dataRow = dataTable_.Rows[0];
            if (dataRow == null) { throw SmartException.create("Invalid row (null)"); }

            // Get any Useful Attributes defined by the generic type.
            List<UsefulAttribute>? attributes = getAttributes<TUsefulObject?>();
            if (attributes == null || attributes.Count < 1) { throw SmartException.create("Invalid Useful Attributes"); }

            // Create and populate the object using UsefulAttributes and the data row.
            usefulObject_ = create<TUsefulObject>(attributes, dataRow);
        }


        // This can be overridden to perform some type of processing after a UsefulObject has been populated (via properties).
        public virtual void process() { }

    }
}