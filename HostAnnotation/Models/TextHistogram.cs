using System;
using System.Collections.Generic;
using System.Text;

using HostAnnotation.Utilities;

namespace HostAnnotation.Models {

    internal class TextHistogram {

        public readonly static char[] SYMBOLS = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
        ];

        public int id { get; set; }

        public string? text { get; set; }

        public Dictionary<string, int> histogram { get; set; }

        // TODO: what's a good way to represent approximate locations of each letter?


        // C-tor
        public TextHistogram() {

            // Initialize the histogram.
            histogram = new Dictionary<string, int>();

            // Initialize the count to zero for all symbols.
            foreach (char symbol in SYMBOLS) {

                // Prepend an underscore to the symbol when using it as a key.
                histogram[$"_{symbol}"] = 0;
            }
        }

        // C-tor
        public TextHistogram(int id_, string? text_) {

            id = id_;

            if (Utils.isEmptyElseTrim(ref text_)) { throw new Exception("Invalid text"); }
            text = text_!.ToLower();
            // TODO: do we also need to filter/remove certain symbols?

            // Initialize the histogram.
            histogram = new Dictionary<string, int>();

            // Initialize the count to zero for all symbols.
            foreach (char symbol in SYMBOLS) {

                // Prepend an underscore to the symbol when using it as a key.
                histogram[$"_{symbol}"] = 0;
            }

            // Populate the histogram using the symbols in the text.
            foreach (char symbol in text.ToCharArray()) {
                if (histogram.ContainsKey($"_{symbol}")) { histogram[$"_{symbol}"]++; }
            }
        }


        public string? createHostTokenHistogramTable() {

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


        public string? createTaxonNameHistogramTable() {

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


        public void generateColumnsAndValuesSQL(StringBuilder columns_, StringBuilder values_) {

            if (columns_ == null) { throw new Exception("Invalid columns (null)"); }
            if (values_ == null) { throw new Exception("Invalid values (null)"); }

            foreach(string? key in histogram.Keys) {

                // Add a column
                columns_.AppendLine($",{key}");

                // Add a value
                values_.Append($", {histogram[key]}");
            }
        }


        public string? generateHostTokenHistogramInsert(string filteredToken_, int hostTokenID_) {

            var columns = new StringBuilder();
            var values = new StringBuilder();

            columns.AppendLine($"host_token_id");
            values.AppendLine(id.ToString());

            generateColumnsAndValuesSQL(columns, values);

            return $"INSERT INTO host_token_histogram ({columns}) VALUES ({values}) ";
        }

        public string? generateTaxonNameHistogramInsert(string taxonName_, int taxonNameID_) {

            var columns = new StringBuilder();
            var values = new StringBuilder();

            columns.AppendLine($"taxon_name_id");
            values.AppendLine(id.ToString());

            generateColumnsAndValuesSQL(columns, values);

            return $"INSERT INTO taxon_name_histogram ({columns}) VALUES ({values}) ";
        }

    }
}
