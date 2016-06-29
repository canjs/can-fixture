@function Store.prototype.reset reset
@parent Store.prototype

@signature `Store.prototype.reset([baseItems])`

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
  @param {Array} TODO describe
