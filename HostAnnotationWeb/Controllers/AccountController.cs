
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

using HostAnnotation.Common;
using HostAnnotationWeb.Controllers.Parameters;
using HostAnnotation.Models;
using HostAnnotationWeb.Models;
using HostAnnotation.Services;
using HostAnnotation.Utilities;

namespace HostAnnotationWeb.Controllers {

    [ApiController]
    public class AccountController : AuthenticatedController {

        private readonly ILogger<AccountController> _logger;

        private readonly IAccountService _accountService;


        // C-tor
        public AccountController(IAccountService accountService_, ILogger<AccountController> logger_) {
            _accountService = accountService_;
            _logger = logger_;
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("getNameFromToken")]
        public async Task<ApiResponse> GetNameFromToken([FromForm] AccountParams.GetNameFromTokenForm form) {

            var response = new ApiResponse();

            try {
                // Sanitize the form parameters.
                form.sanitize();

                Terms.account_request_type requestType = Terms.account_request_type.unknown;
                string? strRequestType = form.requestType;
                if (Utils.isEmptyElseTrim(ref strRequestType) || !Enum.TryParse<Terms.account_request_type>(strRequestType, out requestType)) {
                    throw SmartException.create("Unable to parse request type as an enum");
                }

                string? token = form.token;
                if (Utils.isEmptyElseTrim(ref token)) { throw SmartException.create("Invalid token (empty)"); }

                // Get a person's first name using a request type and their account request token.
                string? firstName = _accountService.getNameFromToken(requestType, token);

                response.data = firstName;
                response.statusCode = HttpStatusCode.OK;
            }
            catch (Exception ex_) {
                response.message = ex_.Message;
                response.statusCode = HttpStatusCode.InternalServerError;
            }

            return response;
        }


        [HttpPost]
        [AllowAnonymous]
        [Route("resetPassword")]
        public async Task<ApiResponse> ResetPassword([FromForm] AccountParams.ResetPasswordForm form) {

            var response = new ApiResponse();

            try {
                // Sanitize the form parameters.
                form.sanitize();

                string? password = form.password;
                if (Utils.isEmptyElseTrim(ref password)) { throw SmartException.create("Invalid password (empty)"); }

                string? token = form.token;
                if (Utils.isEmptyElseTrim(ref token)) { throw SmartException.create("Invalid token (empty)"); }

                string? message = null;

                bool result = _accountService.processPasswordReset(ref message, password, token);

                response.data = new ResetPasswordResult(message, result);
                response.statusCode = HttpStatusCode.OK;
            }
            catch (Exception ex_) {
                response.message = ex_.Message;
                response.statusCode = HttpStatusCode.InternalServerError;
            }

            return response;
        }

    }
}
