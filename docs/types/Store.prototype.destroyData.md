@function can-fixture/StoreType.prototype.destroyData destroyData
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.destroyData(request, response)`

A `requestHandler` that removes an item from the store.

```js
fixture( "DELETE /api/todos/{_id}", todoStore.destroyData );
```
