
from typing import Generic, TypeVar

# About Generics: https://medium.com/@steveYeah/using-generics-in-python-99010e5056eb

T = TypeVar("T")

# The API Response class with a Generic type for the "data" attribute.
class ApiResponse(Generic[T]):

   def __init__(self, data: T, message: str, statusCode: str):
      self.data: T = data
      self.message: str = message
      self.statusCode: str = statusCode
