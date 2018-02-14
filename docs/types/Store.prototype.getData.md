@function can-fixture/StoreType.prototype.getData getData
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.getData(request, response)`

A `requestHandler` that gets a single item from the store.

```js
fixture( "GET /api/todos/{_id}", todoStore.getData );
```
