/*can-fixture@1.1.1#helpers/legacyStore*/
define([
    'require',
    'exports',
    'module',
    './getid',
    'can-set',
    'can-util/js/is-array-like',
    'can-util/js/each',
    'can-util/js/assign'
], function (require, exports, module) {
    var getId = require('./getid');
    var canSet = require('can-set');
    var isArrayLike = require('can-util/js/is-array-like');
    var each = require('can-util/js/each');
    var assign = require('can-util/js/assign');
    function getStartingId(items) {
        var startingId = 0;
        each(items, function (item) {
            if (typeof item.id === 'number') {
                startingId = Math.max(startingId, item.id + 1);
            }
        });
        return startingId;
    }
    module.exports = function (count, make, filter) {
        var nextItemId;
        var getNextItemId = function () {
            return nextItemId++;
        };
        var items, findOne = function (id) {
                for (var i = 0; i < items.length; i++) {
                    if (id == items[i].id) {
                        return items[i];
                    }
                }
            }, methods = {}, types, reset;
        if (isArrayLike(count) && typeof count[0] === 'string') {
            types = count;
            count = make;
            make = filter;
            filter = arguments[3];
        } else if (typeof count === 'string') {
            types = [
                count + 's',
                count
            ];
            count = make;
            make = filter;
            filter = arguments[3];
        }
        if (typeof count === 'number') {
            nextItemId = 0;
            items = [];
            reset = function () {
                items = [];
                for (var i = 0; i < count; i++) {
                    var item = make(i, items);
                    if (!item.id) {
                        item.id = getNextItemId();
                    }
                    items.push(item);
                }
            };
        } else {
            filter = make;
            var initialItems = count;
            nextItemId = getStartingId(initialItems);
            reset = function () {
                items = initialItems.slice(0);
            };
        }
        assign(methods, {
            getListData: function (request) {
                request = request || {};
                var retArr = items.slice(0);
                request.data = request.data || {};
                each((request.data.order || []).slice(0).reverse(), function (name) {
                    var split = name.split(' ');
                    retArr = retArr.sort(function (a, b) {
                        if (split[1].toUpperCase() !== 'ASC') {
                            if (a[split[0]] < b[split[0]]) {
                                return 1;
                            } else if (a[split[0]] === b[split[0]]) {
                                return 0;
                            } else {
                                return -1;
                            }
                        } else {
                            if (a[split[0]] < b[split[0]]) {
                                return -1;
                            } else if (a[split[0]] === b[split[0]]) {
                                return 0;
                            } else {
                                return 1;
                            }
                        }
                    });
                });
                each((request.data.group || []).slice(0).reverse(), function (name) {
                    var split = name.split(' ');
                    retArr = retArr.sort(function (a, b) {
                        return a[split[0]] > b[split[0]];
                    });
                });
                var offset = parseInt(request.data.offset, 10) || 0, limit = parseInt(request.data.limit, 10) || items.length - offset, i = 0;
                for (var param in request.data) {
                    i = 0;
                    if (request.data[param] !== undefined && (param.indexOf('Id') !== -1 || param.indexOf('_id') !== -1)) {
                        while (i < retArr.length) {
                            if (request.data[param] != retArr[i][param]) {
                                retArr.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                    }
                }
                if (typeof filter === 'function') {
                    i = 0;
                    while (i < retArr.length) {
                        if (!filter(retArr[i], request)) {
                            retArr.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                } else if (typeof filter === 'object') {
                    i = 0;
                    while (i < retArr.length) {
                        var subset = canSet.subset(retArr[i], request.data, filter);
                        if (!subset) {
                            retArr.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
                var responseData = {
                    'count': retArr.length,
                    'data': retArr.slice(offset, offset + limit)
                };
                each([
                    'limit',
                    'offset'
                ], function (prop) {
                    if (prop in request.data) {
                        responseData[prop] = request.data[prop];
                    }
                });
                return responseData;
            },
            getData: function (request, response) {
                var item = findOne(getId(request));
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                response(item);
            },
            updateData: function (request, response) {
                var id = getId(request), item = findOne(id);
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                assign(item, request.data);
                response({ id: id }, { location: request.url || '/' + getId(request) });
            },
            destroyData: function (request, response) {
                var id = getId(request), item = findOne(id);
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                for (var i = 0; i < items.length; i++) {
                    if (items[i].id == id) {
                        items.splice(i, 1);
                        break;
                    }
                }
                return {};
            },
            createData: function (settings, response) {
                var item = typeof make === 'function' ? make(items.length, items) : {};
                assign(item, settings.data);
                if (!item.id) {
                    item.id = getNextItemId();
                }
                items.push(item);
                response({ id: item.id }, { location: settings.url + '/' + item.id });
            }
        });
        reset();
        return assign({
            findAll: methods.getListData,
            findOne: methods.getData,
            create: methods.createData,
            update: methods.updateData,
            destroy: methods.destroyData,
            getId: getId,
            find: function (settings) {
                return findOne(getId(settings));
            },
            reset: reset
        }, methods);
    };
});