
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Text;



namespace HostAnnotation.Models {

    internal class TextHistogram {

        public readonly static char[] SYMBOLS = new char[] {
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
        };

        


        #region Create the histogram tables

        public static string? createHostTokenHistogramTable() {

            var sql = new StringBuilder();
            var defaults = new StringBuilder();

            sql.AppendLine("SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON;");

            sql.AppendLine("CREATE TABLE [dbo].[host_token_histogram](");
            sql.AppendLine("[id] [int] IDENTITY(1,1) NOT NULL, ");
            sql.AppendLine("[host_token_id] [int] NOT NULL, ");

            foreach (char symbol in SYMBOLS) {

                // Prepend an underscore to the symbol for the column name.
                sql.AppendLine($"[_{symbol}] [int] NOT NULL, ");

                // Create a default constraint for this symbol's database column.
                defaults.AppendLine($"ALTER TABLE[dbo].[host_token_histogram] ADD CONSTRAINT [DF_host_token_histogram_{symbol}] DEFAULT(0) FOR [_{symbol}] ");
            }

            sql.Append("CONSTRAINT [PK_host_token_histogram] PRIMARY KEY CLUSTERED([id] ASC) WITH (PAD_INDEX = OFF, ");
            sql.Append("STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, ");
            sql.Append("OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY] ");
            sql.AppendLine(") ON [PRIMARY] ");

            // Add default value constraints.
            sql.AppendLine(defaults.ToString());

            return sql.ToString();
        }


        public static string? createTaxonNameHistogramTable() {

            var sql = new StringBuilder();
            var defaults = new StringBuilder();

            sql.AppendLine("SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON;");

            sql.AppendLine("CREATE TABLE [dbo].[taxon_name_histogram](");
            sql.AppendLine("[id] [int] IDENTITY(1,1) NOT NULL, ");
            sql.AppendLine("[taxon_name_id] [int] NOT NULL, ");

            foreach (char symbol in SYMBOLS) {

                // Prepend an underscore to the symbol for the column name.
                sql.AppendLine($"[_{symbol}] [int] NOT NULL, ");

                // Create a default constraint for this symbol's database column.
                defaults.AppendLine($"ALTER TABLE[dbo].[taxon_name_histogram] ADD CONSTRAINT [DF_taxon_name_histogram_{symbol}] DEFAULT(0) FOR [_{symbol}] ");
            }

            sql.Append("CONSTRAINT [PK_taxon_name_histogram] PRIMARY KEY CLUSTERED([id] ASC) WITH (PAD_INDEX = OFF, ");
            sql.Append("STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, ");
            sql.Append("OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY] ");
            sql.AppendLine(") ON [PRIMARY] ");

            // Add default value constraints.
            sql.AppendLine(defaults.ToString());

            return sql.ToString();
        }

        #endregion


        protected void generateColumnsAndValuesSQL(ref StringBuilder columns_, string filteredText_, ref StringBuilder values_) {

            if (columns_ == null) { throw new Exception("Invalid columns (null)"); }
            if (values_ == null) { throw new Exception("Invalid values (null)"); }

            // Just in case, convert the text to lowercase.
            filteredText_ = filteredText_.ToLower();

            var histogram = new Dictionary<char, int>();

            // Populate the histogram with the characters in the filtered text.
            foreach (char c in filteredText_.ToCharArray()) {

                if (!SYMBOLS.Contains(c)) { continue; }

                if (histogram.ContainsKey(c)) {
                    histogram[c] += 1;
                } else {
                    histogram.Add(c, 1);
                }
            }

            foreach (char key in histogram.Keys) {

                // Add a column
                columns_.AppendLine($", _{key}");

                // Add a value
                values_.Append($", {histogram[key]}");
            }
        }


        public string? generateHostTokenHistogramInsert(string filteredToken_, int hostTokenID_) {

            var columns = new StringBuilder();
            var values = new StringBuilder();

            columns.AppendLine($"host_token_id");
            values.AppendLine($"{hostTokenID_}");

            generateColumnsAndValuesSQL(ref columns, filteredToken_, ref values);

            return $"INSERT INTO host_token_histogram ({columns}) VALUES ({values}) ";
        }


        public string? generateTaxonNameHistogramInsert(string filteredTaxonName_, int taxonNameID_) {

            var columns = new StringBuilder();
            var values = new StringBuilder();

            columns.AppendLine($"taxon_name_id");
            values.AppendLine($"{taxonNameID_}");

            generateColumnsAndValuesSQL(ref columns, filteredTaxonName_, ref values);

            return $"INSERT INTO taxon_name_histogram ({columns}) VALUES ({values}) ";
        }

    }
}
