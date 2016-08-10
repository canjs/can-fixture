
- <code>[__can-fixture__ function](#can-fixture-function)</code>
  - <code>[fixture(ajaxSettings, requestHandler(...))](#fixtureajaxsettings-requesthandler)</code>
  - <code>[fixture(ajaxSettings, url)](#fixtureajaxsettings-url)</code>
  - <code>[fixture(ajaxSettings, data)](#fixtureajaxsettings-data)</code>
  - <code>[fixture(ajaxSettings, delay)](#fixtureajaxsettings-delay)</code>
  - <code>[fixture(ajaxSettings, null)](#fixtureajaxsettings-null)</code>
  - <code>[fixture(methodAndUrl, url|data|requestHandler)](#fixturemethodandurl-urldatarequesthandler)</code>
  - <code>[fixture(url, url|data|requestHandler)](#fixtureurl-urldatarequesthandler)</code>
  - <code>[fixture(fixtures)](#fixturefixtures)</code>
  - <code>[fixture(restfulUrl, store)](#fixturerestfulurl-store)</code>
    - <code>[requestHandler(request, response(...), requestHeaders, ajaxSettings)](#requesthandlerrequest-response-requestheaders-ajaxsettings)</code>
      - <code>[response(status, body, headers, statusText)](#responsestatus-body-headers-statustext)</code>
- <code>[fixture.rand(min, max)](#fixturerandmin-max)</code>
- <code>[fixture.rand(choices, min, max)](#fixturerandchoices-min-max)</code>
- <code>[fixture.delay](#fixturedelay)</code>
- <code>[fixture.on](#fixtureon)</code>
- <code>[fixture.fixtures](#fixturefixtures)</code>
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

## API


## <code>__can-fixture__ function</code>
can-fixture intercepts an AJAX request and simulates the response with a file or function. 


### <code>fixture(ajaxSettings, requestHandler(...))</code>


If an XHR request matches ajaxSettings, calls requestHandler with the XHR requests data. Makes the XHR request respond with the return value of requestHandler or the result of calling its response argument.

The following traps requests to GET /todos and responds with an array of data:

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

When adding a fixture, it will remove any identical fixtures from the list of fixtures. The last fixture added will be the first matched.


1. __ajaxSettings__ <code>{Object}</code>:
  An object that is used to match values on an XHR object, namely the url and method. url can be templated like /todos/{_id}.
1. __requestHandler__ <code>{[requestHandler](#requesthandlerrequest-response-requestheaders-ajaxsettings)()}</code>:
  Handles the request and provides a response. The next section details this function's use.
  

### <code>fixture(ajaxSettings, url)</code>


Redirects the request to another url.  This can be useful for simulating a response with a file.

```js
fixture({url: "/tasks"}, "fixtures/tasks.json");
```

Placeholders available in the `ajaxSettings` url will be available in the redirect url:

```js
fixture({url: "/tasks/{id}"}, "fixtures/tasks/{id}.json");
```


### <code>fixture(ajaxSettings, data)</code>


Responds with the `JSON.stringify` result of `data`.

```js
fixture({url: "/tasks"}, {tasks: [{id: 1, complete: false}]});
```


### <code>fixture(ajaxSettings, delay)</code>


Delays the ajax request from being made for `delay` milliseconds.

```js
fixture({url: "/tasks"}, 2000);
```

This doesn't simulate a response, but is useful for simulating slow connections.


### <code>fixture(ajaxSettings, null)</code>


Removes the matching fixture from the list of fixtures.

```js
fixture({url: "/tasks"}, "fixtures/tasks.json");

$.get("/tasks") // requests fixtures/tasks.json

fixture({url: "/tasks"}, null);

$.get("/tasks") // requests /tasks
```


### <code>fixture(methodAndUrl, url|data|requestHandler)</code>


A short hand for creating an `ajaxSetting` with a `method` and `url`.

```js
fixture("GET /tasks", requestHandler );

// is the same as

fixture({method: "get", url: "/tasks"}, requestHandler );
```

The format is `METHOD URL`.


### <code>fixture(url, url|data|requestHandler)</code>


A short hand for creating an `ajaxSetting` with just a `url`.

```js
fixture("/tasks", requestHandler);

// is the same as

fixture({url: "/tasks"}, requestHandler);
```


### <code>fixture(fixtures)</code>


Create multiple fixtures at once.

- fixtures `{Object<methodAndUrl,url|data|requestHandler|store>}` - A mapping of methodAndUrl to
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


### <code>fixture(restfulUrl, store)</code>


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


#### <code>requestHandler(request, response(...), requestHeaders, ajaxSettings)</code>


Defines what can-fixture callback functions are called with.  TODO fix grammar

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

1. __request__ <code>{Object}</code>:
  Information about the request. The request's data property will contain data from the request's querystring or request body.
1. __response__ <code>{can-fixture.requestHandler.response}</code>:
  A callback function that provides response information. The next section details this function's use.
1. __requestHeaders__ <code>{Object}</code>:
  Headers used to make the request.
1. __ajaxSettings__ <code>{Object}</code>:
  The settings object used to match this request.
  

##### <code>response(status, body, headers, statusText)</code>


Used to detail a response.

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


1. __`status`__ <code>{Number}</code>:
  The [HTTP response code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). Ex: `200`.
1. __`body`__ <code>{Object}</code>:
  A JS object that will be serialized and set as the responseText of the XHR object, or
  the raw string text that will be set as the responseText of the XHR object.
1. __`headers`__ <code>{Object}</code>:
  - An object of HTTP response headers and values.
1. __`statusText`__ <code>{String}</code>:
  - The status text of the response. Ex: ``"ok"`` for 200.
  

## <code>fixture.rand(min, max)</code>


Returns a random integer in the range [min, max]. If only one argument is provided,
returns a random integer from [0, max].

```js
fixture.rand(1, 10) //-> Random number between 1 and 10 inclusive.
fixture.rand(10) //-> Random number between 0 and 10 inclusive.
```

1. __min__:
  {Number} TODO describe
1. __max__:
  {Number} TODO describe
  

## <code>fixture.rand(choices, min, max)</code>


An array of between min and max random items from choices. If only `min` is
provided, `max` will equal `min`.  If both `max` and `min` are not provided,
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

1. __choices__:
  {Array} TODO describe
1. __min__:
  {Number} TODO describe
1. __max__:
  {Number} TODO describe
  

## <code>fixture.delay</code>


Sets the delay until a response is fired in milliseconds.

```js
fixture.delay = 1000; // 1 second delay
```


## <code>fixture.on</code>


<a id="fixture.on"/>

Turns the fixtures on or off. Defaults to `true` for on.

```js
fixture.on = false; //-> AJAX requests will not be trapped
```

To remove a fixture you can also use `fixture(ajaxSetting, null)`.


## <code>fixture.fixtures</code>


The list of currently active fixtures.


## <code>fixture.store(baseItems, algebra)</code>


Create a store that starts with `baseItems` for a service layer
described by `algebra`.

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

1. __baseItems__:
  {Array} An array of items that will populate the store.
1. __algebra__:
  {can-set.Algebra} A description of the service layer's parameters.
  

## <code>fixture.store(count, makeItems, algebra)</code>


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

1. __count__:
  {Number} TODO describe
1. __makeItems__:
  {function} A function that will generate `baseItems`
1. __algebra__:
  {can-set.Algebra} A description of the service layer's parameters.
  

## <code>Store</code>


The following documents the methods on a store object returned by `fixture.store`.


### <code>Store.prototype.getListData(request, response)</code>


A `requestHandler` that gets multiple items from the store.

```js
fixture("GET /api/todos", todoStore.getListData);
```

1. __request__ <code>{Object}</code>:
  TODO describe
1. __response__ <code>{Object}</code>:
  TODO describe
  

### <code>Store.prototype.getData(request, response)</code>


A `requestHandler` that gets a single item from the store.

```js
fixture("GET /api/todos/{_id}", todoStore.getData);
```

1. __request__ <code>{Object}</code>:
  TODO describe
1. __response__ <code>{Object}</code>:
  TODO describe
  

### <code>Store.prototype.createData(request, response)</code>


A `requestHandler` that creates an item in the store.

```js
fixture("POST /api/todos", todoStore.createData);
```

1. __request__ <code>{Object}</code>:
  TODO describe
1. __response__ <code>{Object}</code>:
  TODO describe
  

### <code>Store.prototype.updateData(request, response)</code>


A `requestHandler` that updates an item in the store.

```js
fixture("PUT /api/todos/{_id}", todoStore.updateData);
```

1. __request__ <code>{Object}</code>:
  TODO describe
1. __response__ <code>{Object}</code>:
  TODO describe
  

### <code>Store.prototype.destroyData(request, response)</code>


A `requestHandler` that removes an item from the store.

```js
fixture("DELETE /api/todos/{_id}", todoStore.destroyData)
```

1. __request__ <code>{Object}</code>:
  TODO describe
1. __response__ <code>{Object}</code>:
  TODO describe
  

### <code>Store.prototype.reset([baseItems])</code>


Sets the items in the store to their original state or to `baseItems` if it's passed as an argument.

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

1. __TODO__ <code>{Array}</code>:
  describe
  

### <code>Store.prototype.get(params)</code>


Returns a single item's data from the store.

```js
todoStore.get({id: 1}) //-> {id: 1, name: "dishes"}
```

1. __TODO__ <code>{Object}</code>:
  describe
  

### <code>Store.prototype.getList(set)</code>


Returns the matching items from the store like: `{data: [...]}`.

```js
todoStore.get({name: "dishes"}) //-> {data: [{id: 1, name: "dishes"}]}
```

1. __set__ <code>{Object}</code>:
  TODO describe
  
