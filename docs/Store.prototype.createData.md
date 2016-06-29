@function Store.prototype.createData createData
@parent Store.prototype

@signature `Store.prototype.createData(request, response)`

A `requestHandler` that creates an item in the store.

```js
fixture("POST /api/todos", todoStore.createData);
```
  @param {Object} request TODO describe
  @param {Object} response TODO describe
