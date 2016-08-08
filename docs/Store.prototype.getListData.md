@function Store.prototype.getListData getListData
@parent Store.prototype

@signature `Store.prototype.getListData(request, response)`

A `requestHandler` that gets multiple items from the store.

```js
fixture("GET /api/todos", todoStore.getListData);
```
  @param {Object} request TODO describe
  @param {Object} response TODO describe
