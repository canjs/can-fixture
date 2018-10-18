@function can-fixture/StoreType.prototype.getList getList
@parent can-fixture/StoreType.prototype

@description Returns the matching items from the store

@signature `Store.getList(set)`

  Returns the matching items from the store like: `{data: [...]}`.

  ```js
  import {QueryLogic, fixture} from "can";
  import {Todo} from "//unpkg.com/can-demo-models@5";

  const todoQueryLogic = new QueryLogic( Todo );

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes", complete: true}, 
    {id: 2, name: "Walk the dog", complete: false},
    {id: 3, name: "dry the dishes", complete: false},
  ], todoQueryLogic );

  const result = todoStore.getList( {name: "dishes"} );
  console.log( result ); //-> {id: 1, name: "Do the dishes", complete: true}
  ```
  @codepen
