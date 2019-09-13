@function can-fixture.store store
@parent can-fixture.properties
@outline 3

@description Creates a store.

@signature `fixture.store(baseItems, queryLogic)`

  Create a store that starts with `baseItems` for a service layer
  described by `queryLogic`.

  ```js
  import {DefineMap, QueryLogic, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";

  // Describe the services parameters:
  const todoQueryLogic = new QueryLogic(Todo);

  // Create a store with initial data.
  // Pass an empty Array (ex: []) if you want it to be empty.
  const todoStore = fixture.store( [
    {
      id: 1,
      name: "Do the dishes",
      complete: true
    }, {
      id: 2,
      name: "Walk the dog",
      complete: false
    }
  ], todoQueryLogic );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/1"} ).then( result => {
    console.log( result );
  } );
  ```
  @codepen
  @highlight 9-19

  @param {Array} baseItems An array of items that will populate the store.
  @param {can-query-logic} QueryLogic A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  

@signature `fixture.store(baseItems, Type)`

  Create a store that starts with `baseItems` for a service layer for a `Type`.

  ```js
  import {DefineMap, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";

  // Create a store with initial data.
  // Pass an empty Array (ex: []) if you want it to be empty.
  const todoStore = fixture.store( [
    {
      id: 1,
      name: "Do the dishes",
      complete: true
    }, {
      id: 2,
      name: "Walk the dog",
      complete: false
    }
  ], Todo );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/1"} ).then( result => {
    console.log( result );
  } );
  ```
  @codepen
  @highlight 6-16

  @param {Array} baseItems An array of items that will populate the store.
  @param {function(){}} Type Any Type with a [can-reflect.getSchema] symbol.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.

@signature `fixture.store(baseItems, schema)`

  Create a store that starts with `baseItems` for a service layer described by [schema can-reflect.getSchema].

  ```js
  import {DefineMap, fixture, ajax, Reflect} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";

  // Store the schema, so it can be modified if so desired.
  const schema = Reflect.getSchema(Todo);

  // Create a store with initial data.
  // Pass an empty Array (ex: []) if you want it to be empty.
  const todoStore = fixture.store( [
    {
      id: 1,
      name: "Do the dishes",
      complete: true
    }, {
      id: 2,
      name: "Walk the dog",
      complete: false
    }
  ], schema );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/1"} ).then( result => {
    console.log( result );
  } );
  ```
  @codepen
  @highlight 9-19

  @param {Array} baseItems An array of items that will populate the store.
  @param {can-reflect.getSchema} A schema of the keys and identities for this type.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.

@signature `fixture.store(count, makeItems, queryLogic)`

  Similar to `fixture.store(baseItems, queryLogic)`, except that
  it uses `makeItems` to create `count` entries in the store.

  ```js
  import {DefineMap, QueryLogic, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  // Describe the services parameters:
  const todoQueryLogic = new QueryLogic(Todo);

  // Create a store with initial data.
  const todoStore = fixture.store(
    1000,
    ( i ) => ( {
      id: i + 1,
      name: "Todo " + i,
      complete: fixture.rand( [ true, false ], 1 )[ 0 ]
    } ),
    todoQueryLogic
  );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/3"} ).then( result => {
    console.log( result ); //-> "{'_id':3,'name':'Todo 2','complete':true||false}"
  } );

  ```
  @codepen
  @highlight 9-17

  @param {Number} count The number of `baseItems` to create.
  @param {function} makeItems A function that will generate `baseItems`
  @param {can-query-logic} queryLogic A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  

@signature `fixture.store(count, makeItems, Type)`

  Similar to `fixture.store(baseItems, Type)`, except that
  it uses `makeItems` to create `count` entries in the store.

  ```js
  import {DefineMap, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  // Create a store with initial data.
  const todoStore = fixture.store(
    1000,
    ( i ) => ( {
      id: i + 1,
      name: "Todo " + i,
      complete: fixture.rand( [ true, false ], 1 )[ 0 ]
    } ),
    Todo
  );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/3"} ).then( result => {
    console.log( result ); //-> "{'_id':3,'name':'Todo 2','complete':true||false}"
  } );

  ```
  @codepen
  @highlight 6-14

  @param {Number} count The number of `baseItems` to create.
  @param {function} makeItems A function that will generate `baseItems`
  @param {function(){}} Type A type that implements [can-reflect.getSchema].
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  

@signature `fixture.store(count, makeItems, schema)`

  Similar to `fixture.store(baseItems, schema)`, except that
  it uses `makeItems` to create `count` entries in the store.

  ```js
  import {DefineMap, fixture, ajax, Reflect} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  // Get the schema, usually in order to modify it.
  const schema = Reflect.getSchema(Todo);

  // Create a store with initial data.
  const todoStore = fixture.store(
    1000,
    ( i ) => ( {
      id: i + 1,
      name: "Todo " + i,
      complete: fixture.rand( [ true, false ], 1 )[ 0 ]
    } ),
    schema
  );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/3"} ).then( result => {
    console.log( result ); //-> "{'_id':3,'name':'Todo 2','complete':true||false}"
  } );

  ```
  @codepen
  @highlight 9-17

  @param {Number} count The number of `baseItems` to create.
  @param {function} makeItems A function that will generate `baseItems`
  @param {can-query-logic} queryLogic A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.

@body

## Converting to a model schema

Models created with [can-observable-object] and [can-define/map/map] contain a [can-reflect.getSchema] symbol that returns the model's *schema*, which contains the properties the model supports and their type information.

With [can-observable-object] you often create properties with strict types like:

```js
import { ObservableObject } from "can";

class Person extends ObservableObject {
  static props = {
    id: Number
  };
}
```

If you try to pass a string into this property it will throw:

```js
new Person({ id: "1" }); // throws!
```

The fixture store works by translating a query parameter like `/people/1` into a type. Since parameters in a query are all strings, this leads to type errors when creating a new `Person` instance.

If you use [can-type]'s [can-type/convertAll] when creating your fixture, you can ensure that all properties are converted to their intended types:

```js
import { fixture, ObservableObject, type } from "can";

class Person extends ObservableObject {
  static props = {
    id: Number,
    name: String
  };
}

// ... later
const ConvertPerson = type.convertAll(Person);

fixture.store([
  { id: 1, name: "Wilbur" }
], ConvertPerson);
```

This will allow your models to use strict types for values that are part of a query (such as ids).
