using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HostAnnotation.Models {

    public class ResetPasswordResult {

        public string? message { get; set; }
        public bool result { get; set; }

        // C-tor
        public ResetPasswordResult(string? message_, bool result_) {
            message = message_;
            result = result_;
        }
    }
}
