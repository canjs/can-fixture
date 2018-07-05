var QUnit = require('steal-qunit');
var fixture = require("can-fixture");
var QueryLogic = require("can-query-logic");
var canReflect = require("can-reflect");


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

QUnit.test("anything with a schema will be converted to a queryLogic automatically", function(){
    var store = fixture.store(
        [ {_id: 0, name: "foo"} ],
        {identity: ["id"]}
    );

    var res = store.get({_id: 0});
    QUnit.ok(res, "an object works");

    var type = canReflect.assignSymbols({},{
        "can.getSchema": function(){
            return {identity: ["id"]};
        }
    });

    store = fixture.store(
        [ {_id: 0, name: "foo"} ],
        type
    );

    res = store.get({_id: 0});
    QUnit.ok(res, "an object works");
    //.then(function(){ QUnit.ok(true, "got data"); });


});


QUnit.test("createData, destroyData, updateData", function(assert){
    var store = fixture.store([
        {id: 0, name: "foo"}
    ], new QueryLogic({identity: ["id"]}));

    QUnit.stop();
    store.createData({
        data: {name: "bar"}
    }, function(instance){
        QUnit.deepEqual(instance, {id: 1, name: "bar"} );
        QUnit.start();
    });
    /*
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
    });*/
});
