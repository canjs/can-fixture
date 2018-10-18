@function can-fixture/StoreType.prototype.getListData getListData
@parent can-fixture/StoreType.prototype

@signature `Store.getListData(request, response)`

  A `requestHandler` that gets multiple items from the store.

  ```js
  import {QueryLogic, fixture} from "can";
  import {Todo} from "//unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes", complete: true},
    {id: 2, name: "Walk the dog", complete: false}
  ], new QueryLogic(Todo) );

  fixture( "GET /todos", (req, res) => {
    // Will only invoke getListData if authorization header is correct.
    if (req.headers.authorization === "myAuthKey") {
      todoStore.getListData(req, res);
    } else {
      res(401, "incorrect authorization key");
    }
  } );

  $.get("/todos").catch( error => {
    console.log( error.responseText ); //-> "incorrect authorization key"
  });

  $.ajaxSetup({
    headers: {authorization: "myAuthKey"}
  });

  $.get("/todos", {}).then( value => {
    console.log( JSON.parse(value).data ); //-> [ {id:1, name:"Do the dishes", complete:true}, {id:2, name:"Walk the dog", complete:false}]
  });

  ```
  @codepen
