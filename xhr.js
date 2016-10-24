/* global require, window, global */
/* global setTimeout, clearTimeout, XMLHttpRequest */

// This overwrites the default XHR with a mock XHR object.
// The mock XHR object's `.send` method is able to
// call the fixture callbacks or create a real XHR request
// and then respond normally.
var fixtureCore = require("./core");
var deparam = require("./helpers/deparam");
var each = require("can-util/js/each/each");
var setImmediate = require("can-util/js/set-immediate/set-immediate");
// Copy props from source to dest, except those on the XHR prototype and
// listed as excluding.
var assign = function(dest, source, excluding){
		excluding = excluding || {};

		// If the XHRs responseType is not '' or 'text', browsers will throw an error
		// when trying to access the `responseText` property so we have to ignore it
		if(typeof source.responseType === 'undefined' || source.responseType === '' || source.responseType === 'text') {
			delete excluding.responseText;
			delete excluding.responseXML;
			delete excluding.responseType;
		} else {
			excluding.responseText = true;
			excluding.responseXML = true;
			excluding.responseType = true;
		}

		// copy everything on this to the xhr object that is not on `this`'s prototype
		for(var prop in source) {
			if(!( prop in XMLHttpRequest.prototype) && !excluding[prop] ) {
				dest[prop] = source[prop];
			}
       }
};

// Save the real XHR object as XHR
var XHR = XMLHttpRequest,
// Get a global reference.
	GLOBAL = typeof global !== "undefined"? global : window;

// Figure out events on XHR object
// but start with some default events.
var events = ["abort","error","load","loadend","loadstart","progress"];
(function(){
	var x = new XHR();
	for(var prop in x) {
		if(prop.indexOf("on") === 0 &&
			events.indexOf(prop.substr(2)) === -1 &&
			prop !== "onreadystatechange") {
			events.push(prop.substr(2));
		}
	}
})();
// DEFINE HELPERS

// Call all of an event for an XHR object
function callEvents(xhr, ev) {
	var evs = xhr.__events[ev] || [], fn;
	for(var i = 0, len = evs.length; i < len; i++) {
		fn = evs[i];
		fn.call(xhr);
	}
}

var propsToIgnore = { onreadystatechange: true, onload: true, __events: true };
each(events, function(prop){
	propsToIgnore["on"+prop] = true;
});

// Helper that given the mockXHR, creates a real XHR that will call the mockXHR's
// callbacks when the real XHR's request completes.
var makeXHR = function(mockXHR){
	var xhr = mockXHR._xhr;

	// Copy everything on mock to it.
	assign(xhr, mockXHR, propsToIgnore);

	// When the real XHR is called back, update all properties
	// and call all callbacks on the mock XHR.
	xhr.onreadystatechange = function(ev) {
		if(xhr.readyState <= 1) {
			if(typeof xhr.status !== 'number') {
				mockXHR.status = undefined;
			}
		} else {
			// Copy back everything over because in IE8 defineProperty
			// doesn't work, so we need to make our shim XHR have the same
			// values as the real xhr.
			assign(mockXHR, xhr, propsToIgnore);
		}

		if(mockXHR.onreadystatechange) {
			mockXHR.onreadystatechange(ev);
		}
	};

	// wire up events to forward to mock object
	each(events, function(eventName) {
		xhr["on"+eventName] = function() {
			setImmediate(function() {
				assign(mockXHR, xhr, propsToIgnore);
			});
			
			callEvents(mockXHR, eventName);
			if(mockXHR["on"+eventName]) {
				return mockXHR["on"+eventName].apply(mockXHR, arguments);
			}
		};
	});


	// wire up the mockXHR's getResponseHeader to call the real
	// XHR's getResponseHeader.
	if(xhr.getResponseHeader) {
		mockXHR.getResponseHeader = function(){
			return xhr.getResponseHeader.apply(xhr, arguments);
		};
	}

	// Call any additional methods that need to be called on the mock.
	if(mockXHR._disableHeaderCheck && xhr.setDisableHeaderCheck) {
		xhr.setDisableHeaderCheck(true);
	}

	return xhr;
};


GLOBAL.XMLHttpRequest = function(){
	this._requestHeaders = {};
	this._xhr = new XHR();
	this.__events = {};
	// The way code detects if the browser supports onload is to check
	// if a new XHR object has the onload property, so setting it to null
	// passes that check.
	this.onload = null;
	this.onerror = null;
};
GLOBAL.XMLHttpRequest._XHR = XHR;

// Methods on the mock XHR:
assign(XMLHttpRequest.prototype,{
	setRequestHeader: function(name, value){
		this._requestHeaders[name] = value;
	},
	open: function(type, url, async){
		this.type = type;
		this.url = url;
		this.async = async === false ? false : true;
	},
	getAllResponseHeaders: function(){
		return this._xhr.getAllResponseHeaders.apply(this._xhr, arguments);
	},
	addEventListener: function(ev, fn){
		var evs = this.__events[ev] = this.__events[ev] || [];
		evs.push(fn);
	},
	removeEventListener: function(ev, fn){
		var evs = this.__events[ev] = this.__events[ev] || [];
		var idx = evs.indexOf(fn);
		if(idx >= 0) {
			evs.splice(idx, 1);
		}
	},
	setDisableHeaderCheck: function(val){
		this._disableHeaderCheck = !!val;
	},
	getResponseHeader: function(key){
		return "";
	},
	abort: function() {
		var xhr = this._xhr;

		// If we are aborting a delayed fixture we have to make the fake
		// steps that are expected for `abort` to
		if(this.timeoutId !== undefined) {
			clearTimeout(this.timeoutId);
			xhr = makeXHR(this);
			xhr.open(this.type, this.url, this.async === false ? false : true);
			xhr.send();
		}

		return xhr.abort();
	},
	// This needs to compile the information necessary to see if
	// there is a corresponding fixture.
	// If there isn't a fixture, this should create a real XHR object
	// linked to the mock XHR instance and make a data request.
	// If there is a fixture, depending on the type of fixture the following happens:
	// - dynamic fixtures - call the dynamic fixture, use the result to update the
	//   mock XHR object and trigger its callbacks.
	// - redirect fixtures - create a real XHR linked to the mock XHR for the new url.
	send: function(data) {

		// derive the XHR settings object from the XHR object
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
		// if get or delete, the url should not include the querystring.
		// the querystring should be the data.
		if(!xhrSettings.data && xhrSettings.type === "get" || xhrSettings.type === "delete") {
			xhrSettings.data = deparam( xhrSettings.url.split("?")[1] );
			xhrSettings.url = xhrSettings.url.split("?")[0];
		}

		// Try to convert the request body to POJOs.
		if(typeof xhrSettings.data === "string") {
			try {
				xhrSettings.data = JSON.parse(xhrSettings.data);
			} catch(e) {
				xhrSettings.data = deparam( xhrSettings.data );
			}
		}

		// See if the XHR settings match a fixture.
		var fixtureSettings = fixtureCore.get(xhrSettings);
		var mockXHR = this;

		var timeoutId;
		// If a dynamic fixture is being used, we call the dynamic fixture function and then
		// copy the response back onto the `mockXHR` in the right places.
		if(fixtureSettings && typeof fixtureSettings.fixture === "function") {

			this.timeoutId = fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function(status, body, headers, statusText){
				body = typeof body === "string" ? body :  JSON.stringify(body);

				assign(mockXHR,{
					readyState: 4,
					status: status
				});

				var success = (status >= 200 && status < 300 || status === 304);
				if ( success ) {
					assign(mockXHR,{
						statusText: statusText || "OK",
						responseText: body
					});
				} else {
					assign(mockXHR,{
						statusText: statusText || "error",
						responseText: body
					});
				}

				mockXHR.getAllResponseHeaders = function() {
					var ret = [];
					each(headers || {}, function(value, name) {
						Array.prototype.push.apply(ret, [name, ': ', value, '\r\n']);
					});
					return ret.join('');
				};

				if(mockXHR.onreadystatechange) {
					mockXHR.onreadystatechange({ target: mockXHR });
				}

				// fire progress events
				callEvents(mockXHR, "progress");
				if(mockXHR.onprogress) {
					mockXHR.onprogress();
				}

				callEvents(mockXHR, "load");
				if(mockXHR.onload) {
					mockXHR.onload();
				}

				callEvents(mockXHR, "loadend");
				if(mockXHR.onloadend) {
					mockXHR.onloadend();
				}

			});

			return timeoutId;
		}
		// At this point there is either not a fixture or a redirect fixture.
		// Either way we are doing a request.
		var xhr = makeXHR(this),
			makeRequest = function() {
				xhr.open( xhr.type, xhr.url, xhr.async );
				if(mockXHR._requestHeaders) {
					Object.keys(mockXHR._requestHeaders).forEach(function(key) {
						xhr.setRequestHeader(key, mockXHR._requestHeaders[key]);
					});
				}
				return xhr.send(data);
			};

		if(fixtureSettings && typeof fixtureSettings.fixture === "number") {
			//!steal-remove-start
			fixtureCore.log(xhrSettings.url+" -> delay " + fixtureSettings.fixture+"ms");
			//!steal-remove-end
			this.timeoutId = setTimeout(makeRequest, fixtureSettings.fixture);
			return;
		}

		// if we do have a fixture, update the real XHR object.
		if(fixtureSettings) {
			//!steal-remove-start
			fixtureCore.log(xhrSettings.url+" -> " + fixtureSettings.url);
			//!steal-remove-end
			assign(xhr, fixtureSettings);
		}

		// Make the request.
		return makeRequest();
	}
});
