
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Net;

namespace HostAnnotationWeb.Models {

    // The response object returned by API web service calls.
    public class ApiResponse {

        public object? data { get; set; }

        public string? message { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public HttpStatusCode statusCode { get; set; }
        
    }
}
