@function can-fixture/StoreType.prototype.createData createData
@parent can-fixture/StoreType.prototype

@signature `Store.createData(request, response)`

  A `requestHandler` that creates an item in the store.

  ```js
  import {QueryLogic, fixture} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  const todoStore = fixture.store( [], new QueryLogic(Todo) );

  fixture( "POST /todos", (req, res) => {
    // Will only invoke createData if authorization header is correct.
    if (req.headers.authorization === "myAuthKey") {
      todoStore.createData(req, res);
    } else {
      res(401, "incorrect authorization key");
    }
  } );

  const todo = {name:"Write examples!"};

  $.post("/todos", todo).catch( error => {
    console.log(error.responseText); //-> "incorrect authorization key"
  });

  $.ajaxSetup({
    headers: {authorization: "myAuthKey"}
  });

  $.post("/todos", todo).then( value => {
    console.log(value); //-> "{'name':'Write examples!','id':1}"
  });

  ```
  @codepen
  
  @param {object} request A request object
  @param {object} response A response object.
  