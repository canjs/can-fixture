@property {Boolean} can-fixture.on on
@parent can-fixture.properties

@signature `fixture.on`

  Turns the fixtures on or off. Defaults to `true` for on.

  ```js
  import {fixture} from "can";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  fixture( "GET /todos", () => {
    return "success";
  } );

  fixture.on = false; //-> AJAX requests will not be trapped

  $.get("/todos")
    .then( () => {} )
    .catch( error => {
      console.log("Couldn't connect.");
    } );
  ```
  @codepen
  @highlight 8

@body

## Alternatives

To remove a fixture you can also use `fixture(ajaxSetting, null)`.

```js
import {fixture} from "can";
import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

fixture( "GET /todos", () => {
  return "success";
} );

fixture( "GET /todos", null );

$.get("/todos")
  .then( () => {} )
  .catch( error => {
    console.log("Couldn't connect.");
  } );
```
@codepen
@highlight 8

