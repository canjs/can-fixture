@function can-fixture/StoreType.prototype.updateData updateData
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.updateData(request, response)`

  A `requestHandler` that updates an item in the store.

  ```js
  import {QueryLogic, fixture} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes", complete: true},
    {id: 2, name: "Walk the dog", complete: false}
  ], new QueryLogic(Todo) );

  fixture( "PUT /todos/{id}", (req, res) => {
    // Will only invoke updateData if authorization header is correct.
    if (req.headers.authorization === "myAuthKey") {
      todoStore.updateData(req, res);
    } else {
      res(401, "incorrect authorization key");
    }
  } );

  const ajaxSettings = {
    url: "/todos/1",
    type: "PUT",
    data: {name: "test"},
    headers: {authorization: ""}
  };

  $.ajax(ajaxSettings).catch( error => {
    console.log(error.responseText); //-> "incorrect authorization key"
  });

  ajaxSettings.headers.authorization = "myAuthKey";

  $.ajax(ajaxSettings).then( value => {
    console.log(value); //-> "{'name':'test','id':1}"
  });

  ```
  @codepen
