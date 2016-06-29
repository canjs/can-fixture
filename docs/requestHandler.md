@typedef {function} can-fixture.requestHandler requestHandler

@signature `requestHandler(request, response(...), requestHeaders, ajaxSettings)`
Defines what can-fixture callback functions are called with.

Example:

```js
fixture({method: "get", url: "/todos"},
  function(request, response, headers, ajaxSettings){
    request //-> {
            //    method: "get",
            //    url: "/todos",
            //    data: {complete: true}
            //   }

  }
});

$.ajax({ method: "get", url: "/todos?complete=true" })
```

Templated `url` data will be added to the `requestHandler`'s `request` argument's `data` property:

```js
fixture({url: "/todos/{action}"},
  function(request, response, headers, ajaxSettings){
    request //-> {
            //    method: "post",
            //    url: "/todos",
            //    data: {action: delete}
            //   }
  }
});

$.post("/todos/delete");
```
  @param {Object} request Information about the request. The request's data property will contain data from the request's querystring or request body.
  @param {can-fixture.requestHandler.response} response A callback function that provides response information. The next section details this function's use.
  @param {Object} requestHeaders Headers used to make the request.
  @param {Object} ajaxSettings The settings object used to match this request.
