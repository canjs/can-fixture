@function can-fixture/StoreType.prototype.createInstance createInstance
@parent can-fixture/StoreType.prototype

@signature `Store.prototype.createInstance(record)`

Create an instance in the fixture store programatically.  This is usually
used to make sure a record exists when simulating real-time services.

```js
var store = fixture.store([
    {id: 0, name: "foo"}
], new QueryLogic({identity: ["id"]}));

// In a test, make sure the store has the same data you are going
// to "push" to the client:
store.createInstance({name: "lawn"}).then(function(record){
    connection.createInstance(record)
});
```
