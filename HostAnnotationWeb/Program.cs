

using System.Security.Claims;
using System.Text.Json.Serialization;

using HostAnnotation.Common;
using HostAnnotation.Services;
using HostAnnotationWeb.Auth;


// Create a web application builder.
var builder = WebApplication.CreateBuilder(args);

//----------------------------------------------------------------------------------------------
// Get configuration data used by services
//----------------------------------------------------------------------------------------------

// Get the database connection string.
string? dbConnectionString = builder.Configuration.GetValue<string>(Names.ConfigKey.DbConnectionString);
if (string.IsNullOrEmpty(dbConnectionString)) { throw new Exception("Invalid database connection string (empty)"); }

// The environment value will determine which assessment services will be available.
Terms.environment environment = Terms.environment.unknown;

string? strEnvironment = builder.Configuration.GetValue<string>(Names.ConfigKey.Environment);
if (string.IsNullOrEmpty(strEnvironment) || !Enum.TryParse(strEnvironment, out environment)) {
    throw new Exception("Unable to convert Settings.Environment to an enum");
}

// Get the secret key (TODO: move this to IIS ApplicationSettings!)
string? secretKey = builder.Configuration.GetValue<string>(Names.ConfigKey.AuthSecret);

// Get the Token expiration in seconds.
double? expirationInSeconds = builder.Configuration.GetValue<double>(Names.ConfigKey.TokenExpirationInSeconds);


//----------------------------------------------------------------------------------------------
// Add services to the container.
//----------------------------------------------------------------------------------------------

// Add the CORS policy
builder.Services.AddCors(options => {
    options.AddPolicy(name: Names.PolicyName.CORS, policy => {
        // TODO: are we sure we should allow ANY method? Can we restrict this to GET, OPTIONS, and POST?
        policy.AllowAnyMethod();
        policy.AllowAnyOrigin();
        //policy.WithOrigins(new[] { "http://localhost" }); // dmd testing 111123
        policy.WithExposedHeaders(Names.Header.Authorization, Names.Header.ContentType, "Access-Control-Allow-Origin");
        policy.WithHeaders(Names.Header.Authorization, Names.Header.ContentType, "Access-Control-Allow-Origin");
    });
});

// Add JSON serializer options.
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Include PAD-specific environment variables.
builder.Configuration.AddEnvironmentVariables("BVBRC_");

builder.Services.AddSingleton(builder.Configuration);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add the authentication scheme
builder.Services
    .AddAuthentication("Basic")
    .AddScheme<AuthOptions, AuthHandler>("Basic", options_ => {
        options_.SecretKey = secretKey;
    });


// Add the account service.
builder.Services.AddSingleton<IAccountService, AccountService>();

// Add the annotation service.
builder.Services.AddSingleton<IAnnotationService, AnnotationService>();

// Add the curated word service.
builder.Services.AddSingleton<ICuratedWordService, CuratedWordService>();

// Add the Person service.
builder.Services.AddSingleton<IPersonService, PersonService>();

// Add the Taxonomy service.
builder.Services.AddSingleton<ITaxonomyService, TaxonomyService>();

// Add the token service.
builder.Services.AddSingleton<ITokenService, TokenService>();




// Configure authorization policies
builder.Services.AddAuthorization(options => {

    // Only authorize users with the administrator role.
    options.AddPolicy(Names.PolicyName.Administrators, policy => {
        policy.RequireClaim(ClaimTypes.Role, Names.ApiRole.administrator);
    });

    // Only authorize users with the curator or administrator roles.
    options.AddPolicy(Names.PolicyName.Curators, policy => {
        policy.RequireClaim(ClaimTypes.Role, Names.ApiRole.curator, Names.ApiRole.administrator);
    });

    // Only authorize users with the API user, curator, or administrator roles.
    options.AddPolicy(Names.PolicyName.ApiUsers, policy => {
        policy.RequireClaim(ClaimTypes.Role, Names.ApiRole.api_user, Names.ApiRole.curator, Names.ApiRole.administrator);
    });
});


//----------------------------------------------------------------------------------------------
// Configure the Application
//----------------------------------------------------------------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(Names.PolicyName.CORS);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
