

// The response object returned by API web service calls.
export interface IApiResponse<T> {
   data: T;
   message: string;
   statusCode: string;
}