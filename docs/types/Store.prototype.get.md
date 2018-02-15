@function can-fixture/StoreType.prototype.get get
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.get(params)`

Returns a single item's data from the store.

```js
todoStore.get( { id: 1 } ); //-> {id: 1, name: "dishes"}
```
