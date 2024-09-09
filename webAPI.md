# The Host Annotation Web API


## Technology
  - Windows 11 (or comparable version)
  - SQL Server version 16
  - C# .NET 8.0


## Installation (abbreviated)

- Clone or Fork & Clone the [BV-BRC-HostAnnotation](https://github.com/BV-BRC/BV-BRC-HostAnnotation) repository to your local (Windows) machine.
- Open the `HostAnnotation.sln` solution file in Visual Studio and build the solution. 
- Publish the "HostAnnotationWeb" project with a target of "folder".
- Create a zip file containing the published directory, copy the zip file to a directory on the webserver where the API will 
be deployed, and unzip.
- Edit the `appsettings.json` file.
	- Update the database connection string.
	- Change "Settings.Environment" to "production".
	- Update the "SecretSettings.Secret" value.
- Configure IIS on the webserver to host the contents of the Web API directory.



## Services

The following services / API endpoints are available from the deployed web application:

- User account endpoints 
	- **getNameFromToken**: Return the user's name given a UID string.
	- **resetPassword**: Reset the password of the user associated with the UID string parameter.

- Annotation endpoints
	- **annotateHostText**: Run the Host Annotation Pipeline on the host text provided, and return the annotated hostname.
	- **getAnnotatedHost**: Return host data that corresponds with the numeric host ID provided.
	- **getHostTaxaMatches**: Return all taxonomy database matches (with associated annotation metadata) that were found for a specific host ID.
	- **searchAnnotatedHosts**: Return metadata for all annotated hosts whose initial host text matches the search string provided.

- Authentication endpoints
	- **login**: Use an email address and password to login to the application. The authentication token/JWT that is returned can
	be provided along with any following web service request to authenticate the user/request.

- Curated words endpoints
	- **searchCuratedWords**: Search all curated words (alternate spellings, stop words, synonyms, etc.) using the search text provided.

- Taxonomy endpoints
	- **getTaxonName**: Return a taxon name entry from a taxonomy database.
	- **searchTaxonomyDBs**: Search all taxonomy databases for the search text provided.


[Back](./README.md)