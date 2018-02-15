@typedef {function} can-fixture.response response
@parent can-fixture.types

@signature `response(status, body, headers, statusText)`

Used to detail a response.

Example:

```js
fixture( { url: "/todos/{action}" },
	function( request, response, headers, ajaxSettings ) {
		response(
			401,
			{ message: "Unauthorized" },
			{ "WWW-Authenticate": "Basic realm=\"myRealm\"" },
			"unauthorized" );
	}
);

$.post( "/todos/delete" );
```

You don't have to provide every argument to `response`. It can be called like:

```js
// Just body
response( { message: "Hello World" } );

// status and body
response( 401, { message: "Unauthorized" } );

// body and headers
response( "{\"message\":\"Unauthorized\"}", { "WWW-Authenticate": "Basic realm=\"myRealm\"" } );

// status, body statusText
response( 401, "{\"message\":\"Unauthorized\"}", "unauthorized" );
```

The default `statusText` will be `ok` for `200 <= status < 300, status === 304` and `error`
for everything else.

  @param {Number} status The [HTTP response code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). Ex: `200`.
  @param {Object} body A JS object that will be serialized and set as the responseText of the XHR object, or
  the raw string text that will be set as the responseText of the XHR object.
  @param {Object} headers An object of HTTP response headers and values.
  @param {String} statusText The status text of the response. Ex: ``"ok"`` for 200.
