
from ApiResponse import ApiResponse
from marshmallow import Schema, fields, post_load
import requests
from AnnotatedHost import AnnotatedHostSchema, AnnotatedHost
from pprint import pprint
from Settings import Settings

# https://pynative.com/python-convert-json-data-into-custom-python-object/
# https://marshmallow.readthedocs.io/en/stable/


# A schema definition for an ApiResponse class whose data attribute is an AnnotatedHost.
# This is used to deserialize the JSON returned from the web service.
class AnnotatedHostResponseSchema(Schema):
   data = fields.Nested(AnnotatedHostSchema)
   message = fields.Str(allow_none=True)
   statusCode = fields.Str()

   @post_load
   def makeApiResponse(self, data, **kwargs):
        return ApiResponse(**data)



# Use the Web API to annotate host text.
def annotateHostText(hostText: str):
    
   # The payload object contains the parameters for the web service.
   payload = { "hostText": hostText }

   # Create a POST request for the "annotateHostText" web service.
   response = requests.post(f"{Settings.baseURL}/annotateHostText", headers=Settings.headers, data=payload) 
   if response.status_code != requests.codes.ok:
      response.raise_for_status()

   # Get JSON from the Response.
   responseJSON = response.json()

   # Create a schema instance and use it to deserialize the ApiResponse.
   schema = AnnotatedHostResponseSchema()
   apiResponse = schema.load(responseJSON)

   # The data attribute is an AnnotatedHost object.
   return apiResponse.data



if __name__ == '__main__':
    
   # Here's an example of how to use the annotateHost method:
   annotatedHost = annotateHostText("Anas acuta (northern pintail)")

   # See the AnnotatedHost object definition for all available attributes.
   print(f"scientific name = {annotatedHost.scientificName}")