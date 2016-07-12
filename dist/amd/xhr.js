/*xhr*/
define(function (require, exports, module) {
    (function (global) {
        var fixtureCore = require('./core');
        var helpers = require('./helpers/helpers');
        var deparam = require('./helpers/deparam');
        var XHR = XMLHttpRequest, GLOBAL = typeof global !== 'undefined' ? global : window;
        var events = [
            'abort',
            'error',
            'load',
            'loadend',
            'loadstart',
            'progress'
        ];
        (function () {
            var x = new XHR();
            for (var prop in x) {
                if (prop.indexOf('on') === 0 && events.indexOf(prop.substr(2)) === -1 && prop !== 'onreadystatechange') {
                    events.push(prop.substr(2));
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
        var assign = function (dest, source, excluding) {
            excluding = excluding || {};
            for (var prop in source) {
                if (!(prop in XMLHttpRequest.prototype) && !excluding[prop]) {
                    dest[prop] = source[prop];
                }
            }
        };
        var propsToIgnore = {
            onreadystatechange: true,
            onload: true,
            __events: true
        };
        helpers.each(events, function (prop) {
            propsToIgnore['on' + prop] = true;
        });
        var makeXHR = function (mockXHR) {
            var xhr = new XHR();
            assign(xhr, mockXHR, propsToIgnore);
            xhr.onreadystatechange = function (ev) {
                assign(mockXHR, xhr, propsToIgnore);
                if (mockXHR.onreadystatechange) {
                    mockXHR.onreadystatechange(ev);
                }
            };
            helpers.each(events, function (eventName) {
                xhr['on' + eventName] = function () {
                    callEvents(mockXHR, eventName);
                    if (mockXHR['on' + eventName]) {
                        return mockXHR['on' + eventName].apply(mockXHR, arguments);
                    }
                };
            });
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
                return '';
            },
            send: function (data) {
                var xhrSettings = {
                    url: this.url,
                    data: data,
                    headers: this._headers,
                    type: this.type.toLowerCase() || 'get',
                    async: this.async
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
                    return fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function (status, body, headers, statusText) {
                        body = typeof body === 'string' ? body : JSON.stringify(body);
                        helpers.extend(mockXHR, {
                            readyState: 4,
                            status: status
                        });
                        var success = status >= 200 && status < 300 || status === 304;
                        if (success) {
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
                        helpers.each(headers || {}, function (value, key) {
                            mockXHR._headers[key] = value;
                        });
                        if (mockXHR.onreadystatechange) {
                            mockXHR.onreadystatechange({ target: mockXHR });
                        }
                        callEvents(mockXHR, 'progress');
                        if (mockXHR.onprogress) {
                            mockXHR.onprogress();
                        }
                        if (success) {
                            callEvents(mockXHR, 'load');
                            if (mockXHR.onload) {
                                mockXHR.onload();
                            }
                        } else {
                            callEvents(mockXHR, 'error');
                            if (mockXHR.onerror) {
                                mockXHR.onerror();
                            }
                        }
                        callEvents(mockXHR, 'loadend');
                        if (mockXHR.onloadend) {
                            mockXHR.onloadend();
                        }
                    });
                }
                var xhr = makeXHR(this), makeRequest = function () {
                        mockXHR._xhr = xhr;
                        xhr.open(xhr.type, xhr.url, xhr.async);
                        return xhr.send(data);
                    };
                if (fixtureSettings && typeof fixtureSettings.fixture === 'number') {
                    setTimeout(makeRequest, fixtureSettings.fixture);
                    return;
                }
                if (fixtureSettings) {
                    helpers.extend(xhr, fixtureSettings);
                }
                return makeRequest();
            }
        });
    }(function () {
        return this;
    }()));
});