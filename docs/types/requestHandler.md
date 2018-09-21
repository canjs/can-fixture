@typedef {function(can-fixture/types/request,can-fixture.response,Object,Object)} can-fixture.requestHandler(request,response,requestHeaders,ajaxSettings) requestHandler
@parent can-fixture.types

@signature `requestHandler(request, response(...), requestHeaders, ajaxSettings)`

  Defines the XHR response for a given trapped request.

  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( { method: "get", url: "/todos" },
    ( request, response, headers, ajaxSettings ) => {
      console.log( request.method );  //-> "get"
      console.log( request.url );     //-> "/todos"
      console.log( request.data );    //-> {complete: "true"}
    }
  );

  $.get("/todos?complete=true");
  ```
  @codepen

  Templated `url` data will be added to the `requestHandler`'s `request` argument's `data` property:

  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( { url: "/todos/{action}" },
    ( request, response, headers, ajaxSettings ) => {
      console.log( request.method );  //-> "post"
      console.log( request.url );     //-> "/todos/delete"
      console.log( request.data );    //-> {action: "delete"}
    }
  );

  $.post( "/todos/delete" );
  ```
  @codepen

  @param {can-fixture/types/request} request Information about the request. The request's data property will contain data from the request's querystring or request body. Also
  any templated values in the [can-fixture/types/ajaxSettings]'s `url` will be added.
  @param {can-fixture.response} response A callback function that provides response information.
  @param {Object} requestHeaders Headers used to make the request.
  @param {Object} ajaxSettings The settings object used to match this request.
