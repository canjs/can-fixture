var QUnit = require('steal-qunit');
var fixture = require("can-fixture");
var QueryLogic = require("can-query-logic");


QUnit.module("can-fixture.store");


QUnit.test("createInstance, destroyInstance, updateInstance", function(assert){
    var store = fixture.store([
        {id: 0, name: "foo"}
    ], new QueryLogic({identity: ["id"]}));

    QUnit.stop();
    store.createInstance({name: "bar"}).then(function(instance){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 2,
            data: [
                {id: 0, name: "foo"},
                {id: 1, name: "bar"}
            ]
        });

        return store.updateInstance({id: 1, name: "updated"});
    })
    .then(function(instance){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 2,
            data: [
                {id: 0, name: "foo"},
                {id: 1, name: "updated"}
            ]
        });
        return store.destroyInstance(instance);
    })
    .then(function(){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 1,
            data: [
                {id: 0, name: "foo"}
            ]
        });
        QUnit.start();
    });
});
