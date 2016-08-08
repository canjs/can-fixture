@function Store.prototype.updateData updateData
@parent Store.prototype

@signature `Store.prototype.updateData(request, response)`

A `requestHandler` that updates an item in the store.

```js
fixture("PUT /api/todos/{_id}", todoStore.updateData);
```
  @param {Object} request TODO describe
  @param {Object} response TODO describe
