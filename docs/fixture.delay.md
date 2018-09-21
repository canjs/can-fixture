@property {Number} can-fixture.delay delay
@parent can-fixture.properties

@signature `fixture.delay`

  Sets the delay until a response is fired in milliseconds.

  ```js
  import {QueryLogic, fixture} from "//unpkg.com/can@5/core.mjs";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  const todoQueryLogic = new QueryLogic(
    {identity: ["id"]}
  );

  const todoStore = fixture.store( [
    { id: 1, name: "Do the dishes" },
    { id: 2, name: "Walk the dog" }
  ], todoQueryLogic );

  fixture( "/api/todos/{id}", todoStore ); // can also be written fixture("/api/todos", todoStore);

  fixture.delay = 3000;

  $.get("/api/todos/1").then(result => {
    clearInterval(timer);
    console.log(result); //-> { id: 1, name: "Do the dishes" },
  });

  // logs seconds passed
  let i = 0;
  const timer = setInterval(() => {
    console.log(++i + " second(s) passed");
  }, 1000);

  ```
  @codepen
  @highlight 15,only