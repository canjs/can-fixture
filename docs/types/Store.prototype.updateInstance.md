@function can-fixture/StoreType.prototype.updateInstance updateInstance
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.updateInstance(request, response)`

Destroy an instance in the fixture store programatically.  This is usually
used to make sure a record exists in the store when simulating real-time services.

```js
var store = fixture.store([
    {id: 0, name: "dishes"}
], new QueryLogic({identity: ["id"]}));

// In a test, make sure the store has updated the same data that
// the client is being told has been updated.
store.updateInstance({id: 0, name: "do the dishes"}).then(function(record){
    connection.updateInstance(record)
});
```
