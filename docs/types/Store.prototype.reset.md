@function can-fixture/StoreType.prototype.reset reset
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.reset([baseItems])`

Sets the items in the store to their original state or to `baseItems` if it's passed as an argument.

```js
// Creates a store with one item.
const todoStore = fixture.store(
	[ { id: 1, name: "dishes" } ],
	new QueryLogic({identity: ["id"]}) );
fixture( "/todos/{id}", todoStore );
todoStore.getList( {} ).length; //-> 1

// delete that item
$.ajax( { url: "todos/1", method: "delete" } ).then( function() {
	return todoStore.getList( {} ).length; //-> 0
} ).then( function() {

	// calling reset adds it back
	todoStore.reset();
	todoStore.getList( {} ).length; //-> 1
} );
```
  @param {Array} baseItems If provided, adds these items to the store.  
  This can be useful for setting up particular testing scenarios.
