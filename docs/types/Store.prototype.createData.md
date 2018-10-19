@function can-fixture/StoreType.prototype.createData createData
@parent can-fixture/StoreType.prototype

@description Creates records in the store. It can serve as a [can-fixture.requestHandler requestHandler].

@signature `Store.createData(request, response)`

  Creates records in the store. It can serve as a `requestHandler`. The example will store the the object in the data parameter in the store.

  ```js
  import {QueryLogic, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";

  const todoStore = fixture.store( [], new QueryLogic(Todo) );

  fixture( "POST /todos", (req, res) => {
    todoStore.createData(req, res);
  } );

  const ajaxSettings = {
    url: "/todos",
    type: "POST",
    data: {name:"Write examples!"}
  };

  ajax(ajaxSettings).then(result => {
    console.log(result) //-> {id: 1, name: "Write examples!"}
  });

  ```
  @codepen
  
  @param {object} request A request object
  @param {object} response A response object.
  