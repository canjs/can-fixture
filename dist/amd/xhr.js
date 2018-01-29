/*can-fixture@2.0.0#xhr*/
define([
    'require',
    'exports',
    'module',
    './core',
    'can-deparam',
    'can-util/js/assign',
    'can-util/js/each',
    'can-util/js/log'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var fixtureCore = require('./core');
        var deparam = require('can-deparam');
        var assign = require('can-util/js/assign');
        var each = require('can-util/js/each');
        var canLog = require('can-util/js/log');
        var XHR = XMLHttpRequest, GLOBAL = typeof global !== 'undefined' ? global : window;
        var props = [
            'type',
            'url',
            'async',
            'response',
            'responseText',
            'responseType',
            'responseXML',
            'responseURL',
            'status',
            'statusText',
            'readyState'
        ];
        var events = [
            'abort',
            'error',
            'load',
            'loadend',
            'loadstart',
            'progress',
            'readystatechange'
        ];
        (function () {
            var x = new XHR();
            for (var prop in x) {
                if (prop.indexOf('on') === 0) {
                    if (events.indexOf(prop.substr(2)) === -1) {
                        events.push(prop.substr(2));
                    }
                } else if (props.indexOf(prop) === -1 && typeof x[prop] !== 'function') {
                    props.push(prop);
                }
            }
        }());
        function callEvents(xhr, ev) {
            var evs = xhr.__events[ev] || [], fn;
            for (var i = 0, len = evs.length; i < len; i++) {
                fn = evs[i];
                fn.call(xhr);
            }
        }
        GLOBAL.XMLHttpRequest = function () {
            var mockXHR = this;
            var realXHR = new XHR();
            this._xhr = realXHR;
            this._requestHeaders = {};
            this.__events = {};
            each(events, function (eventName) {
                realXHR['on' + eventName] = function () {
                    callEvents(mockXHR, eventName);
                    if (mockXHR['on' + eventName]) {
                        return mockXHR['on' + eventName].apply(mockXHR, arguments);
                    }
                };
            });
            this.onload = null;
        };
        GLOBAL.XMLHttpRequest._XHR = XHR;
        assign(XMLHttpRequest.prototype, {
            setRequestHeader: function (name, value) {
                this._requestHeaders[name] = value;
            },
            open: function (type, url, async) {
                this.type = type;
                this.url = url;
                this.async = async === false ? false : true;
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
                return this._xhr.getResponseHeader(key);
            },
            abort: function () {
                var xhr = this._xhr;
                if (this.timeoutId !== undefined) {
                    clearTimeout(this.timeoutId);
                    xhr.open(this.type, this.url, this.async === false ? false : true);
                    xhr.send();
                }
                return xhr.abort();
            },
            send: function (data) {
                var type = this.type.toLowerCase() || 'get';
                var xhrSettings = {
                    url: this.url,
                    data: data,
                    headers: this._requestHeaders,
                    type: type,
                    method: type,
                    async: this.async,
                    xhr: this
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
                var mockXHR = this;
                if (fixtureSettings && typeof fixtureSettings.fixture === 'function') {
                    this.timeoutId = fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function (status, body, headers, statusText) {
                        body = typeof body === 'string' ? body : JSON.stringify(body);
                        mockXHR._xhr = {
                            open: function () {
                            },
                            send: function () {
                            },
                            abort: function () {
                            },
                            getResponseHeader: function () {
                            }
                        };
                        assign(mockXHR, {
                            readyState: 4,
                            status: status
                        });
                        var success = status >= 200 && status < 300 || status === 304;
                        if (success) {
                            assign(mockXHR, {
                                statusText: statusText || 'OK',
                                responseText: body
                            });
                        } else {
                            assign(mockXHR, {
                                statusText: statusText || 'error',
                                responseText: body
                            });
                        }
                        mockXHR.getAllResponseHeaders = function () {
                            var ret = [];
                            each(headers || {}, function (value, name) {
                                Array.prototype.push.apply(ret, [
                                    name,
                                    ': ',
                                    value,
                                    '\r\n'
                                ]);
                            });
                            return ret.join('');
                        };
                        if (mockXHR.onreadystatechange) {
                            mockXHR.onreadystatechange({ target: mockXHR });
                        }
                        callEvents(mockXHR, 'progress');
                        if (mockXHR.onprogress) {
                            mockXHR.onprogress();
                        }
                        callEvents(mockXHR, 'load');
                        if (mockXHR.onload) {
                            mockXHR.onload();
                        }
                        callEvents(mockXHR, 'loadend');
                        if (mockXHR.onloadend) {
                            mockXHR.onloadend();
                        }
                    });
                    return;
                }
                var makeRequest = function () {
                    mockXHR._xhr.open(mockXHR._xhr.type, mockXHR._xhr.url, mockXHR._xhr.async);
                    if (mockXHR._requestHeaders) {
                        Object.keys(mockXHR._requestHeaders).forEach(function (key) {
                            mockXHR._xhr.setRequestHeader(key, mockXHR._requestHeaders[key]);
                        });
                    }
                    return mockXHR._xhr.send(data);
                };
                if (fixtureSettings && typeof fixtureSettings.fixture === 'number') {
                    canLog.log(xhrSettings.url + ' -> delay ' + fixtureSettings.fixture + 'ms');
                    this.timeoutId = setTimeout(makeRequest, fixtureSettings.fixture);
                    return;
                }
                if (fixtureSettings) {
                    canLog.log(xhrSettings.url + ' -> ' + fixtureSettings.url);
                    assign(mockXHR, fixtureSettings);
                }
                return makeRequest();
            }
        });
        each(props, function (prop) {
            Object.defineProperty(XMLHttpRequest.prototype, prop, {
                get: function () {
                    return this._xhr[prop];
                },
                set: function (newVal) {
                    try {
                        this._xhr[prop] = newVal;
                    } catch (e) {
                    }
                }
            });
        });
    }(function () {
        return this;
    }(), require, exports, module));
});