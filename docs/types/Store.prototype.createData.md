@function can-fixture/StoreType.prototype.createData createData
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.createData(request, response)`

A `requestHandler` that creates an item in the store.

```javascript
fixture("POST /api/todos", todoStore.createData);
```
