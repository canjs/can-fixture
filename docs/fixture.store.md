@function can-fixture.store store
@parent can-fixture.properties

@signature `fixture.store(baseItems, queryLogic)`

Create a store that starts with `baseItems` for a service layer
described by `queryLogic`.

```js
const Todo = DefineMap.extend({
	id: {identity: true, type: "number"},
	completed: "boolean"
})

// Describe the services parameters:
const todoQueryLogic = new QueryLogic(Todo);

// Create a store with initial data.
// Pass [] if you want it to be empty.
const todoStore = fixture.store( [
	{
		_id: 1,
		name: "Do the dishes",
		complete: true
	}, {
		_id: 2,
		name: "Walk the dog",
		complete: false
	} ],
todoQueryLogic );

// Hookup urls to the store:
fixture( "/todos/{_id}", todoStore );
```
  @param {Array} baseItems An array of items that will populate the store.
  @param {can-query-logic} QueryLogic A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  


@signature `fixture.store(count, makeItems, queryLogic)`

Similar to `fixture.store(baseItems, queryLogic)`, except that
it uses `makeItems` to create `count` entries in the store.

```js
// Describe the services parameters:
const todoQueryLogic = new QueryLogic( /* ... */ );

// Create a store with initial data.
// Pass [] if you want it to be empty.
const todoStore = fixture.store(
	1000,
	function( i ) {
		return {
			_id: i + 1,
			name: "Todo " + i,
			complete: fixture.rand( [ true, false ], 1 )[ 0 ]
		};
	},
	todoQueryLogic );

// Hookup urls to the store:
fixture( "/todos/{_id}", todoStore );
```
  @param {Number} count TODO describe
  @param {function} makeItems A function that will generate `baseItems`
  @param {can-query-logic} queryLogic A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  
