@function Store.prototype.getList getList
@parent Store.prototype

@signature `Store.prototype.getList(set)`

Returns the matching items from the store like: `{data: [...]}`.

```js
todoStore.get({name: "dishes"}) //-> {data: [{id: 1, name: "dishes"}]}
```
  @param {Object} set TODO describe
