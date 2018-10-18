@function can-fixture/StoreType.prototype.getData getData
@parent can-fixture/StoreType.prototype

@signature `Store.getData(request, response)`

  A `requestHandler` that gets a single item from the store.

  ```js

  import {QueryLogic, fixture} from "can";
  import {Todo} from "//unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes", complete: true},
    {id: 2, name: "Walk the dog", complete: false}
  ], new QueryLogic(Todo) );

  fixture( "GET /todos/{id}", (req, res) => {
    // Will only invoke destroyData if authorization header is correct.
    if (req.headers.authorization === "myAuthKey") {
      todoStore.getData(req, res);
    } else {
      res(401, "incorrect authorization key");
    }
  } );

  $.get("/todos/1").catch( error => {
    console.log( error.responseText ); //-> "incorrect authorization key"
  });

  $.ajaxSetup({
    headers: {authorization: "myAuthKey"}
  });

  $.get("/todos/1", {}).then( value => {
    console.log( value ); //-> "{'id':1,'name':'Do the dishes','complete':true}"
  });

  ```
  @codepen
