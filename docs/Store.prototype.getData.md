@function Store.prototype.getData getData
@parent Store.prototype

@signature `Store.prototype.getData(request, response)`

A `requestHandler` that gets a single item from the store.

```js
fixture("GET /api/todos/{_id}", todoStore.getData);
```
  @param {Object} request TODO describe
  @param {Object} response TODO describe
