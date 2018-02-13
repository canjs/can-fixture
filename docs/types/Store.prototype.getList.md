@function can-fixture/StoreType.prototype.getList getList
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.getList(set)`

Returns the matching items from the store like: `{data: [...]}`.

```javascript
todoStore.get({name: "dishes"}) //-> {data: [{id: 1, name: "dishes"}]}
```
