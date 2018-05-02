@module {function} can-fixture
@parent can-data-modeling
@collection can-core
@group can-fixture.properties properties
@group can-fixture.types types
@package ../package.json

@description can-fixture intercepts an AJAX request and simulates the response with a file or function.

@signature `fixture(ajaxSettings, requestHandler(...))`

If an XHR request matches ajaxSettings, calls requestHandler with the XHR requests data. Makes the XHR request respond with the return value of requestHandler or the result of calling its response argument.

The following traps requests to GET /todos and responds with an array of data:

```js
fixture( { method: "get", url: "/todos" },
	function( request, response, headers, ajaxSettings ) {
		return {
			data: [
				{ id: 1, name: "dishes" },
				{ id: 2, name: "mow" }
			]
		};
	} );
```

When adding a fixture, it will remove any identical fixtures from the list of fixtures. The last fixture added will be the first matched.

  @param {can-fixture/types/ajaxSettings} ajaxSettings An object that is used to match values on an XHR object, namely the url and method. url can be templated like /todos/{_id}.
  @param {can-fixture.requestHandler} requestHandler Handles the request and provides a response. The next section details this function's use.

@signature `fixture(ajaxSettings, url)`

Redirects the request to another url.  This can be useful for simulating a response with a file.

```js
fixture( { url: "/tasks" }, "fixtures/tasks.json" );
```

Placeholders available in the `ajaxSettings` url will be available in the redirect url:

```js
fixture( { url: "/tasks/{id}" }, "fixtures/tasks/{id}.json" );
```

@signature `fixture(ajaxSettings, data)`

Responds with the `JSON.stringify` result of `data`.

```js
fixture( { url: "/tasks" }, { tasks: [ { id: 1, complete: false } ] } );
```

@signature `fixture(ajaxSettings, delay)`

Delays the ajax request from being made for `delay` milliseconds.

```js
fixture( { url: "/tasks" }, 2000 );
```

This doesn't simulate a response, but is useful for simulating slow connections.

@signature `fixture(ajaxSettings, null)`

Removes the matching fixture from the list of fixtures.

```js
fixture( { url: "/tasks" }, "fixtures/tasks.json" );

$.get( "/tasks" ); // requests fixtures/tasks.json

fixture( { url: "/tasks" }, null );

$.get( "/tasks" ); // requests /tasks
```

@signature `fixture(methodAndUrl, url|data|requestHandler)`

A short hand for creating an [can-fixture/types/ajaxSettings] with a `method` and `url`.

```js
fixture( "GET /tasks", requestHandler );

// is the same as

fixture( { method: "get", url: "/tasks" }, requestHandler );
```

The format is `METHOD URL`.

@signature `fixture(url, url|data|requestHandler)`

A short hand for creating an [can-fixture/types/ajaxSettings] with just a `url`.

```js
fixture( "/tasks", requestHandler );

// is the same as

fixture( { url: "/tasks" }, requestHandler );
```

@signature `fixture(fixtures)`

Create multiple fixtures at once.

```js
fixture( {
	"POST /tasks": function() {
		return { id: Math.random() };
	},
	"GET /tasks": { data: [ { id: 1, name: "mow lawn" } ] },
	"/people": "fixtures/people.json"
} );
```

  @param {Object<methodAndUrl,String|Object|can-fixture.requestHandler|can-fixture/StoreType>} fixtures A mapping of methodAndUrl to
  some response argument type.



@signature `fixture(restfulUrl, store)`

Wire up a restful API scheme to a store.

```js
const todoQueryLogic = new QueryLogic(
	{identity: ["id"]}
);
const todoStore = fixture.store( [
	{ id: 1, name: "Do the dishes" },
	{ id: 2, name: "Walk the dog" }
], todoQueryLogic );

fixture( "/api/todos/{id}", todoStore ); // can also be written fixture("/api/todos", todoStore);
```

This is a shorthand for wiring up the `todoStore` as follows:

```js
fixture( {
	"GET /api/todos": todoStore.getListData,
	"GET /api/todos/{id}": todoStore.getData,
	"POST /api/todos": todoStore.createData,
	"PUT /api/todos/{id}": todoStore.updateData,
	"DELETE /api/todos/{id}": todoStore.destroyData
} );
```

  @param {String} restfulUrl The url that may include a template for the place of the ID prop.  The `list` url is assumed to be `restfulUrl` with the `/{ID_PROP}` part removed, if provided; otherwise the `item` url is assumed to have the `/{ID_PROP}` part appended to the end.
  @param {can-fixture/StoreType} store A store produced by [can-fixture.store].
