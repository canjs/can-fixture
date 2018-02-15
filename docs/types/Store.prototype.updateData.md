@function can-fixture/StoreType.prototype.updateData updateData
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.updateData(request, response)`

A `requestHandler` that updates an item in the store.

```js
fixture( "PUT /api/todos/{_id}", todoStore.updateData );
```
