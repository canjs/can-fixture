@function can-fixture/StoreType.prototype.destroyData destroyData
@parent can-fixture/StoreType.prototype

@signature `Store.destroyData(request, response)`

  A `requestHandler` that removes an item from the store.

  ```js
  import {QueryLogic, fixture} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes", complete: true},
    {id: 2, name: "Walk the dog", complete: false}
  ], new QueryLogic(Todo) );

  fixture("/todos", todoStore)

  fixture( "DELETE /todos/{id}", (req, res) => {
    // Will only invoke destroyData if authorization header is correct.
    if (req.headers.authorization === "myAuthKey") {
      todoStore.destroyData(req, res);
    } else {
      res(401, "incorrect authorization key");
    }
  } );

  const ajaxSettings = {
    url: "/todos/1",
    type: "DELETE",
    headers: {authorization: ""}
  };

  $.ajax(ajaxSettings).catch( error => {
    console.log(error.responseText); //-> "incorrect authorization key"
  });

  ajaxSettings.headers.authorization = "myAuthKey";

  $.ajax(ajaxSettings).then( value => {
    console.log(value); //-> "{'name':'test','id':1}"
  });

  $.get("/todos").then( value => {
    console.log( JSON.parse(value).data ); //-> {id: 2, name: "Walk the dog"}
  });

  ```
  @codepen
