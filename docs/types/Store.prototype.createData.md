@function can-fixture/StoreType.prototype.createData createData
@parent can-fixture/StoreType.prototype

@description Creates records in the store. It can serve as a [can-fixture.requestHandler requestHandler].

@signature `Store.createData(request, response)`

  Creates records in the store. It can serve as a `requestHandler`. The example will store the the object in the data parameter in the store.

  ```js
  import {QueryLogic, fixture, ajax} from "//unpkg.com/can@5/core.mjs";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes", complete: true},
    {id: 2, name: "Walk the dog", complete: true},
    {id: 3, name: "Write docs", complete: false}
  ], new QueryLogic() );

  fixture( "GET /todos", (req, res) => {
    todoStore.getListData(req, res);
  } );

  const ajaxOptions = {
    url: "/todos",
    data: { filter: {complete: true} }
  }

  ajax( ajaxOptions ).then( value => {
    console.log( value.data ); //-> [
    //   {id:1, name:"Do the dishes"},
    //   {id:2, name:"Walk the dog"} 
    // ]
  });

  ```
  @codepen
  
  @param {object} request An HTTP Request object
  @param {object} response An HTTP response object.
  