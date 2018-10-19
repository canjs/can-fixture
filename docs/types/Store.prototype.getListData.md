@function can-fixture/StoreType.prototype.getListData getListData
@parent can-fixture/StoreType.prototype

@description A `requestHandler` that gets multiple items from the store.

@signature `Store.getListData(request, response)`

  A `requestHandler` that gets multiple items from the store.

  ```js
  import {QueryLogic, fixture, ajax} from "can";
  import {Todo} from "//unpkg.com/can-demo-models@5";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes"},
    {id: 2, name: "Walk the dog"}
  ], new QueryLogic(Todo) );

  fixture( "GET /todos", (req, res) => {
    todoStore.getListData(req, res);
  } );

  ajax( {url: "/todos"} ).then( value => {
    console.log( value.data ); //-> [
    //   {id:1, name:"Do the dishes"},
    //   {id:2, name:"Walk the dog"} 
    // ]
  });

  ```
  @codepen
