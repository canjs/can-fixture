/*core*/
define(function (require, exports, module) {
    var canSet = require('can-set');
    var helpers = require('./helpers/helpers');
    var sub = require('./helpers/sub');
    require('./store');
    var fixtures = [];
    exports.fixtures = fixtures;
    exports.add = function (settings, fixture) {
        if (fixture && (fixture.getData || fixture.getListData)) {
            var root = settings, store = fixture, idProp = store.idProp;
            fixture = undefined;
            settings = {};
            settings['GET ' + root] = store.getData;
            settings['DELETE ' + root] = store.destroyData;
            settings['PUT ' + root] = store.updateData;
            var getListUrl = root.replace(new RegExp('\\/\\{' + idProp + '\\}.*'), '');
            settings['GET ' + getListUrl] = store.getListData;
            settings['POST ' + getListUrl] = store.createData;
        }
        if (fixture !== undefined) {
            if (typeof settings === 'string') {
                var matches = settings.match(/(GET|POST|PUT|DELETE|PATCH) (.+)/i);
                if (!matches) {
                    settings = { url: settings };
                } else {
                    settings = {
                        url: matches[2],
                        type: matches[1]
                    };
                }
            }
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
        } else {
            helpers.each(settings, function (fixture, url) {
                exports.add(url, fixture);
            });
        }
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
        } else {
            setTimeout(callFixture, $fixture.delay);
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
        var fixtureSettings = index >= 0 ? helpers.extend({}, fixtures[index]) : undefined;
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
                var xhrData = helpers.extend({}, xhrSettings.data || {});
                fixtureSettings.data = helpers.extend(xhrData, data);
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
        if (a == null && helpers.isEmptyObject(b)) {
            return true;
        } else if (b == null && helpers.isEmptyObject(a)) {
            return true;
        } else {
            return canSet.equal(a, b);
        }
    };
    exports.defaultCompare = {
        url: function (a, b) {
            return !!exports.dataFromUrl(b, a);
        },
        fixture: function () {
            return true;
        },
        type: function (a, b) {
            return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
        },
        helpers: function () {
            return true;
        },
        headers: isEmptyOrNull,
        data: isEmptyOrNull
    };
    var replacer = /\{([^\}]+)\}/g;
    exports.dataFromUrl = function (fixtureUrl, url) {
        var order = [], fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.').replace('?', '\\?'), res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
                order.push(part);
                return '([^/]+)';
            }) + '$').exec(url), data = {};
        if (!res) {
            return null;
        }
        res.shift();
        helpers.each(order, function (name) {
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
    exports.log = function () {
    };
});