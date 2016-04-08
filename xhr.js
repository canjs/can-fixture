// This overwrites the default XHR with a mock XHR object.
// The mock XHR object's `.send` method is able to
// call the fixture callbacks or create a real XHR request
// and then respond normally.
var fixtureCore = require("./core");
var canSet = require("can-set");
var helpers = canSet.helpers;
var deparam = require("./helpers/deparam");

// Save the real XHR object as XHR
var XHR = XMLHttpRequest,
// Get a global reference.
	GLOBAL = typeof global !== "undefined"? global : window;

// DEFINE HELPERS

// Call all of an event for an XHR object
function callEvents(xhr, ev) {
	var evs = xhr.__events[ev] || [], fn;
	for(var i = 0, len = evs.length; i < len; i++) {
		fn = evs[i];
		fn.call(xhr);
	}
}
// Copy props from source to dest, except those on the XHR prototype and
// listed as excluding.
var assign = function(dest, source, excluding){
	excluding = excluding || {};

	// copy everything on this to the xhr object that is not on `this`'s prototype
	for(var prop in source){
		if(!( prop in XMLHttpRequest.prototype) && !excluding[prop] ) {
			dest[prop] = source[prop];
		}
	}
};

// Helper that given the mockXHR, creates a real XHR that will call the mockXHR's
// callbacks when the real XHR's request completes.
var makeXHR = function(mockXHR){
	// Make a real XHR
	var xhr = new XHR();
	// Copy everything on mock to it.
	assign(xhr, mockXHR);

	// When the real XHR is called back, update all properties
	// and call all callbacks on the mock XHR.
	xhr.onreadystatechange = function(ev){

		// Copy back everything over because in IE8 defineProperty
		// doesn't work, so we need to make our shim XHR have the same
		// values as the real xhr.
		assign(mockXHR, xhr,{ onreadystatechange: true, onload: true });
		if(mockXHR.onreadystatechange) {
			mockXHR.onreadystatechange(ev);
		}
	};

	xhr.onload = function(){
		callEvents(mockXHR, "load");
		if(mockXHR.onload) {
			return mockXHR.onload.apply(mockXHR, arguments);
		}
	};

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
	var headers = this._headers = {};
	this._xhr = {
		getAllResponseHeaders: function(){
			return headers;
		}
	};
	this.__events = {};
	// The way code detects if the browser supports onload is to check
	// if a new XHR object has the onload property, so setting it to null
	// passes that check.
	this.onload = null;
	this.onerror = null;
};
// Methods on the mock XHR:
helpers.extend(XMLHttpRequest.prototype,{
	setRequestHeader: function(name, value){
		this._headers[name] = value;
	},
	open: function(type, url){
		this.type = type;
		this.url = url;
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
		var xhrSettings = {
			url: this.url,
			data: data,
			headers: this._headers,
			type: this.type.toLowerCase() || 'get'
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

		// If a dynamic fixture is being used, we call the dynamic fixture function and then
		// copy the response back onto the `mockXHR` in the right places.
		if(fixtureSettings && typeof fixtureSettings.fixture === "function") {
			var mockXHR = this;
			return fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function(status, body, headers, statusText){
				body = typeof body === "string" ? body :  JSON.stringify(body);

				helpers.extend(mockXHR,{
					readyState: 4,
					status: status
				});
				if ( (status >= 200 && status < 300 || status === 304) ) {
					helpers.extend(mockXHR,{
						statusText: statusText || "OK",
						responseText: body
					});
				} else {
					helpers.extend(mockXHR,{
						statusText: statusText || "error",
						responseText: body
					});
				}
				if(mockXHR.onreadystatechange) {
					mockXHR.onreadystatechange({ target: mockXHR });
				}
				if(mockXHR.onload) {
					mockXHR.onload();
				}
			});
		}
		// At this point there is either not a fixture or a redirect fixture.
		// Either way we are doing a request.

		// Make a realXHR object based around the settings of the mockXHR.
		var xhr = makeXHR(this);

		// if we do have a fixture, update the real XHR object.
		if(fixtureSettings) {
			//!steal-remove-start
			fixtureCore.log(xhrSettings.url+" -> " + fixtureSettings.url);
			//!steal-remove-end
			helpers.extend(xhr, fixtureSettings);
		}

		// Make the request.
		this._xhr = xhr;
		xhr.open(xhr.type, xhr.url);
		return xhr.send(data);
	}
});
