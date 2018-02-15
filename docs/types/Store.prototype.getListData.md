@function can-fixture/StoreType.prototype.getListData getListData
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.getListData(request, response)`

A `requestHandler` that gets multiple items from the store.

```js
fixture( "GET /api/todos", todoStore.getListData );
```
