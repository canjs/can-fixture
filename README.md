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

The fixture function has a wide variety of signatures that allow more control or easier shorthands.  The previous
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

Finally, you can create a [can-connect](http://connect.canjs.com/) like object that simulates a restful
service and provides methods to .

```js
var tasksStore = fixture.store([{
				_id : 1,
				name : 'Cheese City',
				slug : 'cheese-city',
			}, {
				_id : 2,
				name : 'Crab Barn',
				slug : 'crab-barn',
			}], );
```


## APIs

### `fixture(ajaxSettingsOrUrl, requestHandlerOrUrl)`



For example:

```js
fixture({url: "/service", method: "get"}, function(){
  
})
```



#### `fixture(ajaxSettings, function(request, responseHandler, requestHeaders))`

### fixture(url, 
