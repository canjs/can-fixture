/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*helpers/sub*/
define('can-fixture/helpers/sub', function (require, exports, module) {
    var strReplacer = /\{([^\}]+)\}/g;
    var getObject = function (prop, data, remove) {
        var res = data[prop];
        if (remove) {
            delete data[prop];
        }
        return res;
    };
    var isContainer = function (current) {
        return typeof current === 'object' || typeof current === 'object';
    };
    module.exports = function (str, data, remove) {
        var obs = [];
        str = str || '';
        obs.push(str.replace(strReplacer, function (whole, inside) {
            var ob = getObject(inside, data, remove);
            if (ob === undefined || ob === null) {
                obs = null;
                return '';
            }
            if (isContainer(ob) && obs) {
                obs.push(ob);
                return '';
            }
            return '' + ob;
        }));
        return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
    };
});
/*helpers/getid*/
define('can-fixture/helpers/getid', function (require, exports, module) {
    module.exports = function (xhrSettings, fixtureSettings) {
        var id = xhrSettings.data.id;
        if (id === undefined && typeof xhrSettings.data === 'number') {
            id = xhrSettings.data;
        }
        if (id === undefined) {
            xhrSettings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
                id = num;
            });
        }
        if (id === undefined) {
            id = xhrSettings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
                if (num !== 'update') {
                    id = num;
                }
            });
        }
        if (id === undefined) {
            id = Math.round(Math.random() * 1000);
        }
        return id;
    };
});
/*helpers/legacyStore*/
define('can-fixture/helpers/legacyStore', function (require, exports, module) {
    var helpers = require('can-set').helpers;
    var getId = require('can-fixture/helpers/getid');
    var canSet = require('can-set');
    module.exports = function (count, make, filter) {
        var currentId = 0, items, findOne = function (id) {
                for (var i = 0; i < items.length; i++) {
                    if (id == items[i].id) {
                        return items[i];
                    }
                }
            }, methods = {}, types, reset;
        if (helpers.isArrayLike(count) && typeof count[0] === 'string') {
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
            items = [];
            reset = function () {
                items = [];
                for (var i = 0; i < count; i++) {
                    var item = make(i, items);
                    if (!item.id) {
                        item.id = i;
                    }
                    currentId = Math.max(item.id + 1, currentId + 1) || items.length;
                    items.push(item);
                }
            };
        } else {
            filter = make;
            var initialItems = count;
            reset = function () {
                items = initialItems.slice(0);
            };
        }
        helpers.extend(methods, {
            getListData: function (request) {
                request = request || {};
                var retArr = items.slice(0);
                request.data = request.data || {};
                helpers.each((request.data.order || []).slice(0).reverse(), function (name) {
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
                helpers.each((request.data.group || []).slice(0).reverse(), function (name) {
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
                helpers.each([
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
                helpers.extend(item, request.data);
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
                helpers.extend(item, settings.data);
                if (!item.id) {
                    item.id = currentId++;
                }
                items.push(item);
                response({ id: item.id }, { location: settings.url + '/' + item.id });
            }
        });
        reset();
        return helpers.extend({
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
/*store*/
define('can-fixture/store', function (require, exports, module) {
    var canSet = require('can-set');
    var helpers = canSet.helpers;
    var connect = require('can-connect');
    var legacyStore = require('can-fixture/helpers/legacyStore');
    require('can-connect/data/memory-cache/memory-cache');
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
            helpers.each(baseItems, function (item) {
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
    helpers.extend(Store.prototype, {
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
    helpers.each({
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
            idProp = helpers.firstProp(algebra.clauses.id || {}) || 'id';
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
        } else if (helpers.isArrayLike(count)) {
            algebra = make;
            idProp = helpers.firstProp(algebra.clauses.id || {}) || 'id';
            makeItems = makeMakeItems(count, idProp);
        }
        var connection = connect(['data-memory-cache'], {
            algebra: algebra,
            idProp: idProp
        });
        return new Store(connection, makeItems, idProp);
    };
    module.exports = Store;
});
/*core*/
define('can-fixture/core', function (require, exports, module) {
    var canSet = require('can-set');
    var helpers = canSet.helpers;
    var sub = require('can-fixture/helpers/sub');
    var Store = require('can-fixture/store');
    var fixtures = [];
    exports.fixtures = fixtures;
    exports.add = function (settings, fixture) {
        if (fixture && fixture instanceof Store) {
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
        setTimeout(function () {
            var result = fixtureSettings.fixture(xhrSettings, response, xhrSettings.headers, fixtureSettings);
            if (result !== undefined) {
                response(200, result);
            }
        }, $fixture.delay);
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
/*helpers/deparam*/
define('can-fixture/helpers/deparam', function (require, exports, module) {
    var helpers = require('can-set').helpers;
    var digitTest = /^\d+$/, keyBreaker = /([^\[\]]+)|(\[\])/g, paramTest = /([^?#]*)(#.*)?$/, prep = function (str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        };
    module.exports = function (params) {
        var data = {}, pairs, lastPart;
        if (params && paramTest.test(params)) {
            pairs = params.split('&');
            helpers.each(pairs, function (pair) {
                var parts = pair.split('='), key = prep(parts.shift()), value = prep(parts.join('=')), current = data;
                if (key) {
                    parts = key.match(keyBreaker);
                    for (var j = 0, l = parts.length - 1; j < l; j++) {
                        if (!current[parts[j]]) {
                            current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] === '[]' ? [] : {};
                        }
                        current = current[parts[j]];
                    }
                    lastPart = parts.pop();
                    if (lastPart === '[]') {
                        current.push(value);
                    } else {
                        current[lastPart] = value;
                    }
                }
            });
        }
        return data;
    };
});
/*xhr*/
define('can-fixture/xhr', function (require, exports, module) {
    var fixtureCore = require('can-fixture/core');
    var canSet = require('can-set');
    var helpers = canSet.helpers;
    var deparam = require('can-fixture/helpers/deparam');
    var XHR = XMLHttpRequest, GLOBAL = typeof global !== 'undefined' ? global : window;
    function callEvents(xhr, ev) {
        var evs = xhr.__events[ev] || [], fn;
        for (var i = 0, len = evs.length; i < len; i++) {
            fn = evs[i];
            fn.call(xhr);
        }
    }
    var assign = function (dest, source, excluding) {
        excluding = excluding || {};
        for (var prop in source) {
            if (!(prop in XMLHttpRequest.prototype) && !excluding[prop]) {
                dest[prop] = source[prop];
            }
        }
    };
    var makeXHR = function (mockXHR) {
        var xhr = new XHR();
        assign(xhr, mockXHR);
        xhr.onreadystatechange = function (ev) {
            assign(mockXHR, xhr, {
                onreadystatechange: true,
                onload: true
            });
            if (mockXHR.onreadystatechange) {
                mockXHR.onreadystatechange(ev);
            }
        };
        xhr.onload = function () {
            callEvents(mockXHR, 'load');
            if (mockXHR.onload) {
                return mockXHR.onload.apply(mockXHR, arguments);
            }
        };
        if (xhr.getResponseHeader) {
            mockXHR.getResponseHeader = function () {
                return xhr.getResponseHeader.apply(xhr, arguments);
            };
        }
        if (mockXHR._disableHeaderCheck && xhr.setDisableHeaderCheck) {
            xhr.setDisableHeaderCheck(true);
        }
        return xhr;
    };
    GLOBAL.XMLHttpRequest = function () {
        var headers = this._headers = {};
        this._xhr = {
            getAllResponseHeaders: function () {
                return headers;
            }
        };
        this.__events = {};
        this.onload = null;
        this.onerror = null;
    };
    helpers.extend(XMLHttpRequest.prototype, {
        setRequestHeader: function (name, value) {
            this._headers[name] = value;
        },
        open: function (type, url) {
            this.type = type;
            this.url = url;
        },
        getAllResponseHeaders: function () {
            return this._xhr.getAllResponseHeaders.apply(this._xhr, arguments);
        },
        addEventListener: function (ev, fn) {
            var evs = this.__events[ev] = this.__events[ev] || [];
            evs.push(fn);
        },
        removeEventListener: function (ev, fn) {
            var evs = this.__events[ev] = this.__events[ev] || [];
            var idx = evs.indexOf(fn);
            if (idx >= 0) {
                evs.splice(idx, 1);
            }
        },
        setDisableHeaderCheck: function (val) {
            this._disableHeaderCheck = !!val;
        },
        getResponseHeader: function (key) {
            return '';
        },
        send: function (data) {
            var xhrSettings = {
                url: this.url,
                data: data,
                headers: this._headers,
                type: this.type.toLowerCase() || 'get'
            };
            if (!xhrSettings.data && xhrSettings.type === 'get' || xhrSettings.type === 'delete') {
                xhrSettings.data = deparam(xhrSettings.url.split('?')[1]);
                xhrSettings.url = xhrSettings.url.split('?')[0];
            }
            if (typeof xhrSettings.data === 'string') {
                try {
                    xhrSettings.data = JSON.parse(xhrSettings.data);
                } catch (e) {
                    xhrSettings.data = deparam(xhrSettings.data);
                }
            }
            var fixtureSettings = fixtureCore.get(xhrSettings);
            if (fixtureSettings && typeof fixtureSettings.fixture === 'function') {
                var mockXHR = this;
                return fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function (status, body, headers, statusText) {
                    body = typeof body === 'string' ? body : JSON.stringify(body);
                    helpers.extend(mockXHR, {
                        readyState: 4,
                        status: status
                    });
                    if (status >= 200 && status < 300 || status === 304) {
                        helpers.extend(mockXHR, {
                            statusText: statusText || 'OK',
                            responseText: body
                        });
                    } else {
                        helpers.extend(mockXHR, {
                            statusText: statusText || 'error',
                            responseText: body
                        });
                    }
                    if (mockXHR.onreadystatechange) {
                        mockXHR.onreadystatechange({ target: mockXHR });
                    }
                    if (mockXHR.onload) {
                        mockXHR.onload();
                    }
                });
            }
            var xhr = makeXHR(this);
            if (fixtureSettings) {
                helpers.extend(xhr, fixtureSettings);
            }
            this._xhr = xhr;
            xhr.open(xhr.type, xhr.url);
            return xhr.send(data);
        }
    });
});
/*fixture*/
define('can-fixture', function (require, exports, module) {
    var core = require('can-fixture/core');
    var fixture = core.add;
    var helpers = require('can-set').helpers;
    var Store = require('can-fixture/store');
    require('can-fixture/xhr');
    var noop = function () {
    };
    helpers.extend(fixture, {
        rand: function randomize(arr, min, max) {
            if (typeof arr === 'number') {
                if (typeof min === 'number') {
                    return arr + Math.floor(Math.random() * (min - arr + 1));
                } else {
                    return Math.floor(Math.random() * (arr + 1));
                }
            }
            var choices = arr.slice(0);
            if (min === undefined) {
                min = 1;
                max = choices.length;
            } else if (max === undefined) {
                max = min;
            }
            var result = [];
            var selectedCount = min + Math.round(randomize(max - min));
            for (var i = 0; i < selectedCount; i++) {
                var selectedIndex = randomize(choices.length - 1), selected = choices.splice(selectedIndex, 1)[0];
                result.push(selected);
            }
            return result;
        },
        xhr: function (xhr) {
            return helpers.extend({}, {
                abort: noop,
                getAllResponseHeaders: function () {
                    return '';
                },
                getResponseHeader: function () {
                    return '';
                },
                open: noop,
                overrideMimeType: noop,
                readyState: 4,
                responseText: '',
                responseXML: null,
                send: noop,
                setRequestHeader: noop,
                status: 200,
                statusText: 'OK'
            }, xhr);
        },
        store: Store.make,
        fixtures: core.fixtures
    });
    module.exports = fixture;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();