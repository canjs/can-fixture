@typedef {function} can-fixture.response response
@parent can-fixture.types

@description Used to detail a response.

@signature `response( [status], body, [headers], [statusText] )`

  Used to detail a response.

  Using the response function to return an unauthorized error.

  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( {url: "/todos/{action}"},
    ( request, response, headers, ajaxSettings ) => {
      response(
        401,
        { message: "Unauthorized" },
        { "WWW-Authenticate": "Basic realm=\"myRealm\"" },
        "unauthorized"
      );
    }
  );

  // fixture response log {
  //   headers: {WWW-Authenticate: "Basic realm='myRealm'"},
  //   responseBody: {message: "Unauthorized"},
  //   statusCode: 401,
  //   statusText: "unauthorized"
  // }

  $.post( "/todos/delete" ).catch( error => {
    const {status, statusText, responseText} = error;
    console.log(status, statusText, responseText); //-> 401 "unauthorized" "{'message':'Unauthorized'}"
  } );
  ```
  @codepen

  The default `statusText` will be `ok` for `200 <= status < 300`, `status === 304` and `error`
  for everything else.

  @param {Number} status The [HTTP response code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). Ex: `200`.
  @param {Object|String} body A JavaScript object, or a string that will be serialized and set as the responseText of the XHR object, or
  the raw string text that will be set as the responseText of the XHR object.
  @param {Object} headers An object of HTTP response headers and values.
  @param {String} statusText The status text of the response. Ex: ``"ok"`` for 200.

@body

# Use

You don't have to provide every argument to `response`. It can be called like:

- Just the response body, ex: `response( body )`

  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( {url: "/todos"}, ( request, response ) => {
    // Just body
    response( { message: "Hello World" } );
  });

  $.get("/todos").then( result => {
    console.log( result ); //-> "{'message':'Hello World'}"
  } );

  ```
  @codepen
  @highlight 6,only

- response status and body, ex: `response( status, body )`
  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( {url: "/todos"}, ( request, response ) => {
    // status and body
    response( 401, { message: "Unauthorized" } );
  });

  $.get("/todos").catch( error => {
    const {status, responseText} = error;
    console.log( status, responseText ); //-> 401, "{'message':'Unauthorized'}"
  });

  ```
  @codepen
  @highlight 6,only

- response body and headers, ex: `response( body, headers )`

  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( {url: "/todos"}, ( request, response ) => {
    // body and headers
    response( "{\"message\":\"Unauthorized\"}", { "WWW-Authenticate": "Basic realm=\"myRealm\"" } );
  });

  $.get("/todos").then( result => {
    console.log( JSON.parse( result ) ); //-> {message:"Unauthorized"}
  } );

  ```
  @codepen
  @highlight 6,only

- response status, message, and statusText, ex: `response( status, body, statusText )`

  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( {url: "/todos"}, ( request, response ) => {
    // status, body, statusText
    response( 401, "{\"message\":\"Unauthorized\"}", "unauthorized" );
  });

  $.get("/todos").catch( error => {
    const {status, statusText, responseText} = error;
    console.log(status, statusText, responseText); //-> 401 "unauthorized" "{'message':'Unauthorized'}"
  } );

  ```
  @codepen
  @highlight 6,only
