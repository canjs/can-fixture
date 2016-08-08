@function can-fixture.store store

@signature `fixture.store(baseItems, algebra)`

Create a store that starts with `baseItems` for a service layer
described by `algebra`.

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
  @param baseItems {Array} An array of items that will populate the store.
  @param algebra {can-set.Algebra} A description of the service layer's parameters.

@signature `fixture.store(count, makeItems, algebra)`

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
  @param count {Number} TODO describe
  @param makeItems {function} A function that will generate `baseItems`
  @param algebra {can-set.Algebra} A description of the service layer's parameters.
