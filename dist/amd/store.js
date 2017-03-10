/*can-fixture@1.0.12#store*/
define(function (require, exports, module) {
    var canSet = require('can-set');
    var connect = require('can-connect');
    var legacyStore = require('./helpers/legacyStore');
    var each = require('can-util/js/each');
    var assign = require('can-util/js/assign');
    var isArrayLike = require('can-util/js/is-array-like');
    var dataMemoryCache = require('can-connect/data/memory-cache');
    var firstProp = function (obj) {
        for (var prop in obj) {
            return prop;
        }
    };
    var connectToConnection = function (method) {
        return function (req, res) {
            this.connection[method](req.data).then(function (data) {
                res(data);
            }, function (err) {
                res(403, err);
            });
        };
    };
    var makeMakeItems = function (baseItems, idProp) {
        return function () {
            var items = [], maxId = 0;
            each(baseItems, function (item) {
                items.push(JSON.parse(JSON.stringify(item)));
                maxId = Math.max(item[idProp] + 1, maxId + 1) || items.length;
            });
            return {
                maxId: maxId,
                items: items
            };
        };
    };
    var Store = function (connection, makeItems, idProp) {
        this.connection = connection;
        this.makeItems = makeItems;
        this.idProp = idProp;
        this.reset();
        for (var method in Store.prototype) {
            this[method] = this[method].bind(this);
        }
    };
    assign(Store.prototype, {
        getListData: connectToConnection('getListData'),
        getData: connectToConnection('getData'),
        createData: function (req, res) {
            var idProp = this.idProp;
            req.data[idProp] = ++this.maxId;
            this.connection.createData(req.data).then(function (data) {
                var responseData = {};
                responseData[idProp] = req.data[idProp];
                res(responseData);
            }, function (err) {
                res(403, err);
            });
        },
        updateData: connectToConnection('updateData'),
        destroyData: connectToConnection('destroyData'),
        reset: function (newItems) {
            if (newItems) {
                this.makeItems = makeMakeItems(newItems, this.idProp);
            }
            var itemData = this.makeItems();
            this.maxId = itemData.maxId;
            this.connection.addSet({}, { data: itemData.items });
        },
        get: function (params) {
            var id = this.connection.id(params);
            return this.connection.getInstance(id);
        },
        getList: function (set) {
            return this.connection._getListData(set);
        }
    });
    each({
        findAll: 'getListData',
        findOne: 'getData',
        create: 'createData',
        update: 'updateData',
        destroy: 'destroyData'
    }, function (method, prop) {
        Store.prototype[prop] = function () {
            return this[method].apply(this, arguments);
        };
    });
    Store.make = function (count, make, algebra) {
        var isNew = false;
        if (count instanceof canSet.Algebra || make instanceof canSet.Algebra || algebra instanceof canSet.Algebra) {
            isNew = true;
        }
        if (!isNew) {
            return legacyStore.apply(this, arguments);
        }
        var makeItems, idProp;
        if (typeof count === 'number') {
            idProp = firstProp(algebra.clauses.id || {}) || 'id';
            makeItems = function () {
                var items = [];
                var maxId = 0;
                for (var i = 0; i < count; i++) {
                    var item = make(i, items);
                    if (!item[idProp]) {
                        item[idProp] = i;
                    }
                    maxId = Math.max(item[idProp] + 1, maxId + 1) || items.length;
                    items.push(item);
                }
                return {
                    maxId: maxId,
                    items: items
                };
            };
        } else if (isArrayLike(count)) {
            algebra = make;
            idProp = firstProp(algebra.clauses.id || {}) || 'id';
            makeItems = makeMakeItems(count, idProp);
        }
        var connection = connect([dataMemoryCache], {
            algebra: algebra,
            idProp: idProp
        });
        return new Store(connection, makeItems, idProp);
    };
    module.exports = Store;
});