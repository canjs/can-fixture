@function can-fixture.store store
@parent can-fixture.properties

@signature `fixture.store(baseItems, algebra)`

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
  @param {Array} baseItems An array of items that will populate the store.
  @param {can-set.Algebra} algebra A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  


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
  @param {Number} count TODO describe
  @param {function} makeItems A function that will generate `baseItems`
  @param {can-set.Algebra} algebra A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  
