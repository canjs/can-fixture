@typedef {Object} can-fixture/types/request request
@parent can-fixture.types

An object with easily digestible values derived from the mock XHR
object.  

@type {Object}

This object is passed to a [can-fixture.requestHandler]
and can be used to determine the response.

```js
fixture( "GET /todos/{id}", function( request, response ) {
	request.url;     //-> "todos/5"
	request.method;  //-> "get"
	request.data;    //-> {id: "5", include: ["owner"]}
	request.headers; //-> {}
	request.async;   //-> false
} );

$.get( "/todos/5?include[]=owner" );
```

  @option {String} url The requested url with anything after the querystring taken off in `GET` and `DESTROY` method requests.
  @option {String} method The method of the request. Ex: `GET`, `PUT`, `POST`, etc.
  @option {Object} data The data of the querystring or the data to `XMLHTTPRequest.prototype.send` converted back to JavaScript objects with either `JSON.stringify` or [can-deparam].
  @option {Object} headers Headers added to the XHR object with `XMLHTTPRequest.prototype.setRequestHeader`.
  @option {Boolean} async `true` if the request was a synchronous request.
  @option {XMLHTTPRequest} xhr The mock xhr request.
