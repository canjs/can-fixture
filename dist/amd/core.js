/*can-fixture@1.1.0-pre.2#core*/
define(function (require, exports, module) {
    var canSet = require('can-set');
    var sub = require('can-util/js/string').sub;
    var each = require('can-util/js/each');
    var assign = require('can-util/js/assign');
    var isEmptyObject = require('can-util/js/is-empty-object');
    var canLog = require('can-util/js/log');
    var canDev = require('can-util/js/dev');
    require('./store');
    var fixtures = [];
    exports.fixtures = fixtures;
    function isStoreLike(fixture) {
        return fixture && (fixture.getData || fixture.getListData);
    }
    var methodMapping = {
        item: {
            'GET': 'getData',
            'PUT': 'updateData',
            'DELETE': 'destroyData'
        },
        list: {
            'GET': 'getListData',
            'POST': 'createData'
        }
    };
    function getMethodAndPath(route) {
        var matches = route.match(/(GET|POST|PUT|DELETE|PATCH) (.+)/i);
        if (!matches) {
            return [
                undefined,
                route
            ];
        }
        var method = matches[1];
        var path = matches[2];
        return [
            method,
            path
        ];
    }
    function inferIdProp(url) {
        var wrappedInBraces = /\{(.*)\}/;
        var matches = url.match(wrappedInBraces);
        var isUniqueMatch = matches && matches.length === 2;
        if (isUniqueMatch) {
            return matches[1];
        }
    }
    function getItemAndListUrls(url, idProp) {
        idProp = idProp || inferIdProp(url);
        if (!idProp) {
            return [
                undefined,
                url
            ];
        }
        var itemRegex = new RegExp('\\/\\{' + idProp + '\\}.*');
        var rootIsItemUrl = itemRegex.test(url);
        var listUrl = rootIsItemUrl ? url.replace(itemRegex, '') : url;
        var itemUrl = rootIsItemUrl ? url : url.trim() + '/{' + idProp + '}';
        return [
            itemUrl,
            listUrl
        ];
    }
    function addStoreFixture(root, store) {
        var settings = {};
        var typeAndUrl = getMethodAndPath(root);
        var type = typeAndUrl[0];
        var url = typeAndUrl[1];
        var itemAndListUrls = getItemAndListUrls(url, store.idProp);
        var itemUrl = itemAndListUrls[0];
        var listUrl = itemAndListUrls[1];
        if (type) {
            var warning = ['fixture("' + root + '", fixture) must use a store method, not a store directly.'];
            if (itemUrl) {
                var itemAction = methodMapping.item[type];
                if (itemAction) {
                    settings[type + ' ' + itemUrl] = store[itemAction];
                    var itemWarning = 'Replace with fixture("' + type + ' ' + itemUrl + '", fixture.' + itemAction + ') for items.';
                    warning.push(itemWarning);
                }
            }
            var listAction = methodMapping.list[type];
            if (listAction) {
                settings[type + ' ' + listUrl] = store[listAction];
                var listWarning = 'Replace with fixture("' + type + ' ' + listUrl + '", fixture.' + listAction + ') for lists.';
                warning.push(listWarning);
            }
            var message = warning.join(' ');
            canDev.warn(message);
        } else {
            var itemMapping = methodMapping.item;
            for (var itemMethod in itemMapping) {
                var storeItemMethod = itemMapping[itemMethod];
                settings[itemMethod + ' ' + itemUrl] = store[storeItemMethod];
            }
            var listMapping = methodMapping.list;
            for (var listMethod in listMapping) {
                var storeListMethod = listMapping[listMethod];
                settings[listMethod + ' ' + listUrl] = store[storeListMethod];
            }
        }
        return settings;
    }
    function getSettingsFromString(route) {
        var typeAndUrl = getMethodAndPath(route);
        var type = typeAndUrl[0];
        var url = typeAndUrl[1];
        if (type) {
            return {
                type: type,
                url: url
            };
        }
        return { url: url };
    }
    function upsertFixture(fixtureList, settings, fixture) {
        var index = exports.index(settings, true);
        if (index > -1) {
            fixtures.splice(index, 1);
        }
        if (fixture == null) {
            return;
        }
        if (typeof fixture === 'object') {
            var data = fixture;
            fixture = function () {
                return data;
            };
        }
        settings.fixture = fixture;
        fixtures.unshift(settings);
    }
    exports.add = function (settings, fixture) {
        if (fixture === undefined) {
            each(settings, function (fixture, url) {
                exports.add(url, fixture);
            });
            return;
        }
        if (isStoreLike(fixture)) {
            settings = addStoreFixture(settings, fixture);
            exports.add(settings);
            return;
        }
        if (typeof settings === 'string') {
            settings = getSettingsFromString(settings);
        }
        upsertFixture(fixtures, settings, fixture);
    };
    var $fixture = exports.add;
    $fixture.on = true;
    $fixture.delay = 10;
    exports.callDynamicFixture = function (xhrSettings, fixtureSettings, cb) {
        xhrSettings.data = fixtureSettings.data;
        var response = function () {
            var res = exports.extractResponse.apply(xhrSettings, arguments);
            return cb.apply(this, res);
        };
        var callFixture = function () {
            var result = fixtureSettings.fixture(xhrSettings, response, xhrSettings.headers, fixtureSettings);
            if (result !== undefined) {
                response(200, result);
            }
        };
        if (!xhrSettings.async) {
            callFixture();
            return null;
        } else {
            return setTimeout(callFixture, $fixture.delay);
        }
    };
    exports.index = function (settings, exact) {
        for (var i = 0; i < fixtures.length; i++) {
            if (exports.matches(settings, fixtures[i], exact)) {
                return i;
            }
        }
        return -1;
    };
    exports.get = function (xhrSettings) {
        if (!$fixture.on) {
            return;
        }
        var index = exports.index(xhrSettings, true);
        if (index === -1) {
            index = exports.index(xhrSettings, false);
        }
        var fixtureSettings = index >= 0 ? assign({}, fixtures[index]) : undefined;
        if (fixtureSettings) {
            var url = fixtureSettings.fixture, data = exports.dataFromUrl(fixtureSettings.url, xhrSettings.url);
            if (typeof fixtureSettings.fixture === 'string') {
                if (data) {
                    url = sub(url, data);
                }
                fixtureSettings.url = url;
                fixtureSettings.data = null;
                fixtureSettings.type = 'GET';
                if (!fixtureSettings.error) {
                    fixtureSettings.error = function (xhr, error, message) {
                        throw 'fixtures.js Error ' + error + ' ' + message;
                    };
                }
            } else {
                var xhrData = assign({}, xhrSettings.data || {});
                fixtureSettings.data = assign(xhrData, data);
            }
        }
        return fixtureSettings;
    };
    exports.matches = function (settings, fixture, exact) {
        if (exact) {
            return canSet.equal(settings, fixture, {
                fixture: function () {
                    return true;
                }
            });
        } else {
            return canSet.subset(settings, fixture, exports.defaultCompare);
        }
    };
    var isEmptyOrNull = function (a, b) {
        if (a == null && isEmptyObject(b)) {
            return true;
        } else if (b == null && isEmptyObject(a)) {
            return true;
        } else {
            return canSet.equal(a, b);
        }
    };
    var isEmptyOrSubset = function (a, b) {
        if (a == null && isEmptyObject(b)) {
            return true;
        } else if (b == null && isEmptyObject(a)) {
            return true;
        } else {
            return canSet.subset(a, b);
        }
    };
    exports.defaultCompare = {
        url: function (a, b) {
            return !!exports.dataFromUrl(b, a);
        },
        fixture: function () {
            return true;
        },
        xhr: function () {
            return true;
        },
        type: function (a, b) {
            return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
        },
        method: function (a, b) {
            return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
        },
        helpers: function () {
            return true;
        },
        headers: isEmptyOrNull,
        data: isEmptyOrSubset
    };
    var replacer = /\{([^\}]+)\}/g;
    exports.dataFromUrl = function (fixtureUrl, url) {
        if (!fixtureUrl) {
            return {};
        }
        var order = [], fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.').replace('?', '\\?'), res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
                order.push(part);
                return '([^/]+)';
            }) + '$').exec(url), data = {};
        if (!res) {
            return null;
        }
        res.shift();
        each(order, function (name) {
            data[name] = res.shift();
        });
        return data;
    };
    exports.extractResponse = function (status, response, headers, statusText) {
        if (typeof status !== 'number') {
            headers = response;
            response = status;
            status = 200;
        }
        if (typeof headers === 'string') {
            statusText = headers;
            headers = {};
        }
        return [
            status,
            response,
            headers,
            statusText
        ];
    };
});