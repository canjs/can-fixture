[![Build Status](https://api.travis-ci.org/canjs/can-fixture.svg?branch=master)](https://travis-ci.org/canjs/can-fixture)
[![npm version](https://badge.fury.io/js/can-fixture.svg)](http://badge.fury.io/js/can-fixture)

# can-fixture

[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-fixture.svg)](https://greenkeeper.io/)


`can-fixture` intercepts an AJAX request and simulates
the response with a file or function. Use `can-fixture` to:

- Develop JavaScript independently of the backend services.
- Test code that makes AJAX requests without needing a server.
- Simulate slow responses or difficult to reproduce error conditions.

`can-fixture` is self contained and can be used without the rest of CanJS.

[Play around with can-fixture in this JSBin!](https://justinbmeyer.jsbin.com/zixumu/2/edit?html,js,output)

- [Install](#install)
- [Basic Use](#basic-use)
- [API](#api)
  - <code>[fixture(ajaxSettings, requestHandler(...))](#fixtureajaxsettings-requesthandler)</code>
    - <code>[requestHandler(request, response(...), requestHeaders, ajaxSettings)](#requesthandlerrequest-response-requestheaders-ajaxsettings)</code>
      - <code>[response(status, body, headers, statusText)](#responsestatus-body-headers-statustext)</code>
  - <code>[fixture(ajaxSettings, url)](#fixtureajaxsettings-url)</code>
  - <code>[fixture(ajaxSettings, data)](#fixtureajaxsettings-data)</code>
  - <code>[fixture(ajaxSettings, delay)](#fixtureajaxsettings-delay)</code>
  - <code>[fixture(ajaxSettings, null)](#fixtureajaxsettings-null)</code>
  - <code>[fixture(methodAndUrl, url|data|requestHandler)](#fixturemethodandurl-urldatarequesthandler)</code>
  - <code>[fixture(url, url|data|requestHandler)](#fixtureurl-urldatarequesthandler)</code>
  - <code>[fixture(fixtures)](#fixturefixtures)</code>
  - <code>[fixture(restfulUrl, store)](#fixturerestfulurl-store)</code>
  - <code>[fixture.store(baseItems, algebra)](#fixturestorebaseitems-algebra)</code>
  - <code>[fixture.store(count, makeItems, algebra)](#fixturestorecount-makeitems-algebra)</code>
  - <code>[Store](#store)</code>
    - <code>[Store.prototype.getListData(request, response)](#storeprototypegetlistdatarequest-response)</code>
    - <code>[Store.prototype.getData(request, response)](#storeprototypegetdatarequest-response)</code>
    - <code>[Store.prototype.createData(request, response)](#storeprototypecreatedatarequest-response)</code>
    - <code>[Store.prototype.updateData(request, response)](#storeprototypeupdatedatarequest-response)</code>
    - <code>[Store.prototype.destroyData(request, response)](#storeprototypedestroydatarequest-response)</code>
    - <code>[Store.prototype.reset([baseItems])](#storeprototyperesetbaseitems)</code>
    - <code>[Store.prototype.get(params)](#storeprototypegetparams)</code>
    - <code>[Store.prototype.getList(set)](#storeprototypegetlistset)</code>
  - <code>[fixture.rand(min, max)](#fixturerandmin-max)</code>
  - <code>[fixture.rand(choices, min, max)](#fixturerandchoices-min-max)</code>
  - <code>[fixture.delay](#fixturedelay)</code>
  - <code>[fixture.on](#fixtureon)</code>
  - <code>[fixture.fixtures](#fixturefixtures-1)</code>


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
    set.props.id("_id"),
    set.props.boolean("completed"),
    set.props.rangeInclusive("start","end"),
    set.props.sort("orderBy"),
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

## API

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

When adding a fixture, it will remove any identical fixtures from the list of fixtures. The
last fixture added will be the first matched.

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

### `fixture(ajaxSettings, delay)`

Delays the ajax request from being made for `delay` milliseconds.

```js
fixture({url: "/tasks"}, 2000);
```

This doesn't simulate a response, but is useful for simulating slow connections.

### `fixture(ajaxSettings, null)`

Removes the matching fixture from the list of fixtures.

```js
fixture({url: "/tasks"}, "fixtures/tasks.json");

$.get("/tasks") // requests fixtures/tasks.json

fixture({url: "/tasks"}, null);

$.get("/tasks") // requests /tasks
```

### `fixture(methodAndUrl, url|data|requestHandler)`

A short hand for creating an `ajaxSetting` with a `method` and `url`.

```js
fixture("GET /tasks", requestHandler );

// is the same as

fixture({method: "get", url: "/tasks"}, requestHandler );
```

The format is `METHOD URL`.

### `fixture(url, url|data|requestHandler)`

A short hand for creating an `ajaxSetting` with just a `url`.

```js
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
    set.props.id("_id"),
    set.props.boolean("completed"),
    set.props.rangeInclusive("start","end"),
    set.props.sort("orderBy"),
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

### `Store`

The following documents the methods on a store object returned by
`fixture.store`.

#### `Store.prototype.getListData(request, response)`

A `requestHandler` that gets multiple items from the store.

```js
fixture("GET /api/todos", todoStore.getListData);
```

#### `Store.prototype.getData(request, response)`

A `requestHandler` that gets a single item from the store.

```js
fixture("GET /api/todos/{_id}", todoStore.getData);
```

#### `Store.prototype.createData(request, response)`

A `requestHandler` that creates an item in the store.

```js
fixture("POST /api/todos", todoStore.createData);
```

#### `Store.prototype.updateData(request, response)`

A `requestHandler` that updates an item in the store.

```js
fixture("PUT /api/todos/{_id}", todoStore.updateData);
```

#### `Store.prototype.destroyData(request, response)`

A `requestHandler` that removes an item from the store.

```js
fixture("DELETE /api/todos/{_id}", todoStore.destroyData)
```


#### `Store.prototype.reset([baseItems])`

Sets the items in the store to their original state or to `baseItems` if it's passed.

```js
// Creates a store with one item.
var todoStore = fixture.store(
    [{id: 1, name: "dishes"}],
    new set.Algebra());
fixture("/todos/{id}", todoStore)
todoStore.getList({}).length //-> 1

// delete that item
$.ajax({url: "todos/1", method: "delete"}).then(function(){
    return todoStore.getList({}).length //-> 0
}).then(function(){
    // calling reset adds it back
    todoStore.reset();
    todoStore.getList({}).length //-> 1
});
```

#### `Store.prototype.get(params)`

Returns a single item's data from the store.

```js
todoStore.get({id: 1}) //-> {id: 1, name: "dishes"}
```

#### `Store.prototype.getList(set)`

Returns the matching items from the store like: `{data: [...]}`.

```js
todoStore.get({name: "dishes"}) //-> {data: [{id: 1, name: "dishes"}]}
```

### `fixture.rand(min, max)`

Returns a random integer in the range [min, max]. If only one argument is provided,
returns a random integer from [0, max].

```js
fixture.rand(1, 10) //-> Random number between 1 and 10 inclusive.
fixture.rand(10) //-> Random number between 0 and 10 inclusive.
```

### `fixture.rand(choices, min, max)`

An array of between min and max random items from choices. If only `min` is
provided, `max` will equal `min`.  If both `max` ad `min` are not provided,
`min` will be 1 and `max` will be `choices.length`.

```js
// pick a random number of items from an array
fixture.rand(["a","b","c"]) //-> ["c"]
fixture.rand(["a","b","c"]) //-> ["b","a"]

// pick one item from an array
fixture.rand(["a","b","c"],1) //-> ["c"]

// get one item from an array
fixture.rand(["a","b","c"],1)[0] //-> "b"

// get 2 or 3 items from the array
fixture.rand(["a","b","c"],2,3) //-> ["c","a","b"]
```

### `fixture.delay`

Sets the delay until a response is fired in milliseconds.

```js
fixture.delay = 1000; // 1 second delay
```

### `fixture.on`

<a id="fixture.on"/>

Turns the fixtures on or off. Defaults to `true` for on.

```js
fixture.on = false; //-> AJAX requests will not be trapped
```

To remove a fixture you can also use `fixture(ajaxSetting, null)`.


### `fixture.fixtures`

The list of currently active fixtures.  
