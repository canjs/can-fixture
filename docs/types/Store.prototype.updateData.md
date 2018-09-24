@function can-fixture/StoreType.prototype.updateData updateData
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.updateData(request, response)`

  A `requestHandler` that updates an item in the store.

  ```js
  import {DefineMap, QueryLogic, fixture} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  const todoQueryLogic = new QueryLogic(Todo);

  const todoStore = fixture.store( [{
    _id: 1,
    name: "Do the dishes",
    complete: true
  }, {
    _id: 2,
    name: "Walk the dog",
    complete: false
  }],
  todoQueryLogic );

  fixture( "PUT /todos/{_id}", todoStore.updateData );

  fixture( "GET /todos/{_id}", todoStore );

  $.ajax({
    url: "/todos/1",
    type: "PUT",
    data: {name: "test"}
  });

  $.get("/todos/1", (value) => {
    console.log( JSON.parse( value ) );
  } ); //-> {_id: 1, name: "test"}

  ```
  @codepen
