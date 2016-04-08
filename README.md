[![Build Status](https://api.travis-ci.org/canjs/can-fixture.svg?branch=master)](https://travis-ci.org/canjs/can-fixture)
[![npm version](https://badge.fury.io/js/can-fixture.svg)](http://badge.fury.io/js/can-fixture)

# can-fixture


`can-fixture` intercepts an AJAX request and simulates
the response with a file or function. Use `can-fixture` to:

- Develop JavaScript independently of the backend services.
- Test code that makes AJAX requests without needing a server.
- Simulate slow responses or difficult to reproduce error conditions.

`can-fixture` is self contained and can be used without the rest of CanJS.

## Install

If you are using `Browserify` or [StealJS](http://stealjs.com), install it with NPM:

```
npm install can-fixture --save-dev
```

Then `import`, `require`, `steal`, or `define` the `"can-fixture"` module:

```
var fixture = require("can-fixture");
```

## Basic Use

Use the `fixture` function to trap settings on a [XMLHttpRequest object](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) to a request handler.

The following traps all `GET` type requests to `/service` and results in a `responseText` of `"{\"message\":\"Hello World\"}"`:

```js
fixture({url: "/service", method: "get"}, function(request, response){
  response({message: "Hello World"});
})
```

The `fixture` function has a wide variety of signatures that allow more control or easier shorthands.  The previous
example could be written like:

```js
fixture("GET /service", function(request, response){
  return {message: "Hello World"};
})
```

Or:

```js
fixture("GET /service", {message: "Hello World"});
```

You can forward a request to another url:

```js
fixture("GET /service", "/fixtures/service.json");
```

Multiple fixture rules can be setup at once like:

```js
fixture({
  "GET /service": {message: "Hello World"},
  "POST /service": function(request, response){
    response(401,"{type: 'unauthorized'}");
  }
});
```

Remove a fixture by calling `fixture` with null in place of a responseHandler:

```js
fixture("GET /service", null);
```

Finally, use `fixture.store` to create a [can-connect](http://connect.canjs.com/) like-data store that simulates a restful service connected to a data store. Use [can-set](https://github.com/canjs/can-set#can-set) to describe the service's parameters.

```js
// Describe the services parameters:
var todoAlgebra = new set.Algebra({
    set.comparators.id("_id"),
    set.comparators.boolean("completed"),
    set.comparators.rangeInclusive("start","end"),
    set.comparators.sort("orderBy"),
});

// Create a store:
var todoStore = fixture.store([
    {
    	_id : 1,
    	name : 'Do the dishes',
    	complete: true
    }, {
    	_id : 2,
    	name : 'Walk the dog',
    	complete: false
    }],
    todoAlgebra );

// Hookup urls to the store:
fixture("/todos/{_id}", todoStore);
```

If your urls aren't restful you can wire up the store manually:

```js
fixture({
    "GET /todos": todoStore.getListData,
    "POST /todos": todoStore.createData,
    "GET /todos/{_id}": todoStore.getData,
    "PUT /todos/{_id}": todoStore.updateData,
    "DELETE /todos/{_id}": todoStore.deleteData
});
```

## APIs

The `fixture` function has multiple signatures, most based on convenience.  However,
we'll start with the lowest-level API which everything else is based:

### `fixture(ajaxSettings, requestHandler(...))`

If an XHR request matches `ajaxSettings`, calls `requestHandler` with
the XHR requests data.  Makes the XHR request responds with the return value of
`requestHandler` or the result of calling its `response` argument.

- `ajaxSettings` - An object that is used to match values on an XHR object, namely the
 `url` and `method`.  `url` can be templated like `/todos/{_id}`.
- `requestHandler` - Handles the request and provides a response.  The
  next section details this function's use.

The following traps requests to `GET /todos` and responds with an array of data:

```js
fixture({method: "get", url: "/todos"},
        function(request, response, headers, ajaxSettings){
    return {
        data: [
            {id: 1, name: "dishes"},
            {id: 2, name: "mow"}
        ]
    };
})
```

When adding a fixture, it will remove any identical fixtures from the list of fixtures.

#### `requestHandler(request, response(...), requestHeaders, ajaxSettings)`

The request handler argument is called with:

- `request` - Information about the request. The request's `data` property will
  contain data from the request's querystring or request body.
- `response` - A callback function that provides response information. The
  next section details this function's use.
- `requestHeaders` - Headers used to make the request.
- `ajaxSettings` - The settings object used to match this request.

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


#### `response(status, body, headers, statusText)`

Used to detail a response.

- `status` - The [HTTP response code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). Ex: `200`.
- `body` - A JS object that will be serialized and set as the responseText of the XHR object, or
  the raw string text that will be set as the responseText of the XHR object.
- `headers` - An object of HTTP response headers and values.
- `statusText` - The status text of the response. Ex: ``"ok"`` for 200.

Example:

```js
fixture({url: "/todos/{action}"},
  function(request, response, headers, ajaxSettings){
    response(
        401,
        { message: "Unauthorized"},
        { "WWW-Authenticate": 'Basic realm="myRealm"'},
        "unauthorized");
  }
});

$.post("/todos/delete");
```

You don't have to provide every argument to `response`. It can be called like:

```js
// Just body
response({ message: "Hello World"});
// status and body
response(401, { message: "Unauthorized"});
// body and headers
response('{"message":"Unauthorized"}',{"WWW-Authenticate":'Basic realm="myRealm"'});
// status, body statusText
response(401, '{"message":"Unauthorized"}','unauthorized');
```

The default `statusText` will be `ok` for `200 <= status < 300, status === 304` and `error`
for everything else.

### `fixture(ajaxSettings, url)`

Redirects the request to another url.  This can be useful for simulating a response with a file.

```js
fixture({url: "/tasks"}, "fixtures/tasks.json");
```

Placeholders available in the `ajaxSettings` url will be available in the redirect url:

```js
fixture({url: "/tasks/{id}"}, "fixtures/tasks/{id}.json");
```

### `fixture(ajaxSettings, data)`

Responds with the `JSON.stringify` result of `data`.

```js
fixture({url: "/tasks"}, {tasks: [{id: 1, complete: false}]});
```

### `fixture(ajaxSettings, null)`

Removes the matching fixture from the list of fixtures.

```js
fixture({url: "/tasks"}, "fixtures/tasks.json");

$.get("/tasks") // requests fixtures/tasks.json

fixture({url: "/tasks"}, null);

$.get("/tasks") // requests /tasks
```

### `fixture(methodAndUrl, url|data|requestHandler )`

A short hand for creating an `ajaxSetting` with a `method` and `url`.

```
fixture("GET /tasks", requestHandler );

// is the same as

fixture({method: "get", url: "/tasks"}, requestHandler );
```

The format is `METHOD URL`.

### `fixture(url, url|data|requestHandler )`

A short hand for creating an `ajaxSetting` with just a `url`.

```
fixture("/tasks", requestHandler);

// is the same as

fixture({url: "/tasks"}, requestHandler);
```

### `fixture(fixtures)`

Create multiple fixtures at once.

- fixtures `{Object<methodAndUrl,url|data|requestHandler|store>}` - An mapping of methodAndUrl to
  some response argument type.

```js
fixture({
    "POST /tasks": function(){
        return {id: Math.random()}
    },
    "GET /tasks": {data: [{id: 1, name: "mow lawn"}]},
    "/people": "fixtures/people.json"
});
```

### `fixture(restfulUrl, store)`

Wire up a restful API scheme to a store.  

```js
var todoAlgebra = new set.Algebra();
var todoStore = fixture.store([
  { id: 1, name: 'Do the dishes'},
  { id: 2, name: 'Walk the dog'}
], todoAlgebra);

fixture("/api/todos/{id}", todoStore);
```

This is a shorthand for wiring up the `todoStore` as follows:

```js
fixture({
    "GET /api/todos": todoStore.getListData,
    "GET /api/todos/{id}": todoStore.getData,
    "POST /api/todos": todosStore.createData,
    "PUT /api/todos/{id}": todos.updateData,
    "DELETE /api/todos/{id}": todos.destroyData
});
```

### `fixture.store(baseItems, algebra)`

Create a store that starts with `baseItems` for a service layer
described by `algebra`.

- baseItems `{Array}` - An array of items that will populate the store.
- algebra `{can.Algebra}` - A description of the service layer's parameters.

```js
// Describe the services parameters:
var todoAlgebra = new set.Algebra({
    set.comparators.id("_id"),
    set.comparators.boolean("completed"),
    set.comparators.rangeInclusive("start","end"),
    set.comparators.sort("orderBy"),
});

// Create a store with initial data.
// Pass [] if you want it to be empty.
var todoStore = fixture.store([
    {
    	_id : 1,
    	name : 'Do the dishes',
    	complete: true
    }, {
    	_id : 2,
    	name : 'Walk the dog',
    	complete: false
    }],
    todoAlgebra );

// Hookup urls to the store:
fixture("/todos/{_id}", todoStore);
```

### `fixture.store(count, makeItems, algebra)`

Similar to `fixture.store(baseItems, algebra)`, except that
it uses `makeItems` to create `count` entries in the store.

```js
// Describe the services parameters:
var todoAlgebra = new set.Algebra({ ... });

// Create a store with initial data.
// Pass [] if you want it to be empty.
var todoStore = fixture.store(
    1000,
    function(i){
        return {
        	_id : i+1,
        	name : 'Todo '+i,
        	complete: fixture.rand([true, false],1)[0]
        }
    },
    todoAlgebra );

// Hookup urls to the store:
fixture("/todos/{_id}", todoStore);
```

### `fixture.Store`

#### `fixture.Store.reset()`

### `fixture.rand(items)`

### `fixture.delay`

### `fixture.on`

### `fixture.fixtures`

The list of currently active fixtures.  
