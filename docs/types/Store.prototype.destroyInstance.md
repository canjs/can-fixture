@function can-fixture/StoreType.prototype.destroyInstance destroyInstance
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.destroyInstance(request, response)`

Destroy an instance in the fixture store programatically.  This is usually
used to make sure a record exists in the store when simulating real-time services.

```js
var store = fixture.store([
    {id: 0, name: "foo"}
], new QueryLogic({identity: ["id"]}));

// In a test, make sure the store has destroyed the same data that
// the client is being told has been destroyed.
store.destroyInstance({id: 0}).then(function(record){
    connection.destroyInstance(record)
});
```
