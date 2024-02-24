
using System;
using System.Data.SqlClient;
using System.Data;

namespace HostAnnotation.Utilities {

    public class DbRow {

        // The key/value pairs
        protected Dictionary<string, object?>? _values { get; set; }


        // C-tor
        public DbRow() {
            _values = new Dictionary<string, object?>();
        }


        // Add a column and its value.
        public void add(string columnName_, object? value_) {
            _values![columnName_] = value_;
        }

        // Get a column's value.
        public object? get(string columnName_) {
            if (!_values!.ContainsKey(columnName_)) { throw SmartException.create($"No value exists for column {columnName_}"); }
            return _values![columnName_];
        }

        // Get a column's value.
        public T? get<T>(string columnName_) {
            if (!_values!.ContainsKey(columnName_)) { throw SmartException.create($"No value exists for column {columnName_}"); }
            
            object? value = (T?)_values![columnName_];
            if (value == null) { return default; }

            return (T)Convert.ChangeType(value, typeof(T?));
        }


        // Return the results of an SQL SELECT query.
        public static List<DbRow>? select(string dbConnectionString_, string? query_, List<SqlParameter>? parameters_ = null) {

            if (string.IsNullOrEmpty(dbConnectionString_)) { throw SmartException.create("Invalid db connection string"); }
            if (string.IsNullOrEmpty(query_)) { throw SmartException.create("Invalid query"); }

            // Initialize the List of database row objects that will be returned.
            List<DbRow>? rows = null;

            // Create a database connection and a data adaptor.
            using (SqlConnection dbConnection = new SqlConnection(dbConnectionString_))
            using (SqlDataAdapter dataAdaptor = new SqlDataAdapter(query_, dbConnection)) {

                if (parameters_ != null) {
                    foreach (SqlParameter parameter in parameters_) { dataAdaptor.SelectCommand.Parameters.Add(parameter); }
                }

                dbConnection.Open();

                try {
                    DataTable dataTable = new DataTable();

                    // Fill the table with the data returned from the query.
                    dataAdaptor.Fill(dataTable);

                    // Validate the DataTable and its rows
                    if (dataTable == null || dataTable.Rows == null || dataTable.Rows.Count == 0) { return rows; }

                    rows = new List<DbRow>();

                    foreach (DataRow dataRow in dataTable.Rows) {

                        if (dataRow == null) { continue; }

                        // Create a new result row.
                        var resultRow = new DbRow();

                        // Iterate over the columns in the data table
                        foreach (DataColumn column in dataTable.Columns) {

                            if (column == null) { throw SmartException.create("Invalid data column"); }

                            if (dataRow.IsNull(column.ColumnName)) {
                                resultRow.add(column.ColumnName, null);
                                continue;
                            }

                            // Get the value
                            object value = dataRow[column.ColumnName];

                            if (column.DataType == typeof(Byte)) { value = (Byte)value == 1; }

                            // Update the result row
                            resultRow.add(column.ColumnName, value);
                        }

                        // Update the rows that will be returned
                        rows.Add(resultRow);
                    }
                }
                finally {
                    if (dbConnection != null && dbConnection.State != ConnectionState.Closed) { dbConnection.Close(); }
                }
            }

            return rows;
        }

        // Return the first result row of an SQL SELECT query.
        public static DbRow? selectOne(string dbConnectionString_, string? query_, List<SqlParameter>? parameters_ = null) {
            List<DbRow>? rows = select(dbConnectionString_, query_, parameters_);
            return (rows == null || rows.Count < 1) ? null : rows[0];
        }
    }
}
