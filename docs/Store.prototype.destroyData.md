@function Store.prototype.destroyData destroyData
@parent Store.prototype

@signature `Store.prototype.destroyData(request, response)`

A `requestHandler` that removes an item from the store.

```js
fixture("DELETE /api/todos/{_id}", todoStore.destroyData)
```
  @param {Object} request TODO describe
  @param {Object} response TODO describe
