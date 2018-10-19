@function can-fixture/StoreType.prototype.get get
@parent can-fixture/StoreType.prototype

@description Returns a single record's data from the store.

@signature `Store.get( params )`

  Returns a single record's data from the store.

  ```js
  import {QueryLogic, fixture} from "can";
  import {Todo} from "//unpkg.com/can-demo-models@5";

  const todoQueryLogic = new QueryLogic( Todo );

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes"}, 
    {id: 2, name: "Walk the dog"}
  ], todoQueryLogic );

  const result = todoStore.get( {id: 1} );
  console.log( result ); //-> {id: 1, name: "Do the dishes"}

  ```
  @codepen
