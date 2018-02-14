@typedef {function(can-fixture/types/request,can-fixture.response,Object,Object)} can-fixture.requestHandler(request,response,requestHeaders,ajaxSettings) requestHandler
@parent can-fixture.types

@signature `requestHandler(request, response(...), requestHeaders, ajaxSettings)`

Defines the XHR response for a given trapped request.

```js
fixture( { method: "get", url: "/todos" },
	function( request, response, headers, ajaxSettings ) {
		request; //-> {
		//    method: "get",
		//    url: "/todos",
		//    data: {complete: true}
		//   }

	}
);

$.ajax( { method: "get", url: "/todos?complete=true" } );
```

Templated `url` data will be added to the `requestHandler`'s `request` argument's `data` property:

```js
fixture( { url: "/todos/{action}" },
	function( request, response, headers, ajaxSettings ) {
		request; //-> {
		//    method: "post",
		//    url: "/todos",
		//    data: {action: delete}
		//   }
	}
);

$.post( "/todos/delete" );
```
  @param {can-fixture/types/request} request Information about the request. The request's data property will contain data from the request's querystring or request body. Also
  any templated values in the [can-fixture/types/ajaxSettings]'s `url` will be added.
  @param {can-fixture.response} response A callback function that provides response information.
  @param {Object} requestHeaders Headers used to make the request.
  @param {Object} ajaxSettings The settings object used to match this request.
