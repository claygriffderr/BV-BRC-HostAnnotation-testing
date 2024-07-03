
# Configuration settings for the Host Annotation Web API.
class Settings():

   # The access token JWT (JSON Web Token). NOTE: don't store the access token in version control!
   accessToken: str = "TODO: your access token goes here"

   baseURL: str = "https://[TODO: The web API URL goes here]/HostAnnotation"

   # Add the access token as the "Authorization" header.
   headers: str = { "Authorization": accessToken }