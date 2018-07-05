@typedef {Object} can-fixture/types/ajaxSettings ajaxSettings
@parent can-fixture.types

An object used to match incoming [can-fixture/types/request] objects.

@type {Object}

This object is used to match values on [can-fixture/types/request] objects.
If there's a match, the fixture handler provided with the
[can-fixture/types/ajaxSettings] will be invoked.

If a property on an `ajaxSettings` is not provided, all request values
will be matched for that property.

For example,
you can match all `GET` requests, no matter what `url` is passed like:

```
fixture({method: "GET"}, function(){ ... });
```


  @option {String} url The requested url with anything after the querystring taken off in `GET` and `DESTROY` method requests.  For example, you can't match:

  ```
  fixture({method: "GET", url: "/things?name=Justin"});
  ```

  Instead write:

  ```
  fixture({method: "GET", url: "/things", data: {name: "Justin"}});
  ```

  The `url` can have templates like:

  ```
  fixture({method: "GET", url: "/things/{id}"})
  ```

  The templated values get added to the [can-fixture/types/request] object's `data`.

  @option {String} [method] The method of the request. Ex: `GET`, `PUT`, `POST`, etc. Capitalization is ignored.
  @option {Object} [data] Match the data of the request. The data of the querystring or the data to `XMLHTTPRequest.prototype.send` is converted to a JavaScript objects with either `JSON.stringify` or [can-deparam].  The data must match part of the `request`'s data.
  @option {Boolean} [async] Write `true` to match asynchronous requests only.  
