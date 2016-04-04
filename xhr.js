// Overwrites XHR
var fixtureCore = require("./core");
var canSet = require("can-set");
var helpers = canSet.helpers;
var deparam = require("./helpers/deparam");


var XHR = XMLHttpRequest,
	g = typeof global !== "undefined"? global : window;

g.XMLHttpRequest = function(){
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

XMLHttpRequest.prototype.setRequestHeader = function(name, value){
	this._headers[name] = value;
};
XMLHttpRequest.prototype.open = function(type, url){
	this.type = type;
	this.url = url;
};
XMLHttpRequest.prototype.getAllResponseHeaders = function(){
	return this._xhr.getAllResponseHeaders.apply(this._xhr, arguments);
};

XMLHttpRequest.prototype.addEventListener = function(ev, fn){
	var evs = this.__events[ev] = this.__events[ev] || [];
	evs.push(fn);
};

XMLHttpRequest.prototype.removeEventListener = function(ev, fn){
	var evs = this.__events[ev] = this.__events[ev] || [];
	var idx = evs.indexOf(fn);
	if(idx >= 0) {
		evs.splice(idx, 1);
	}
};

XMLHttpRequest.prototype.setDisableHeaderCheck = function(val){
	this._disableHeaderCheck = !!val;
};

XMLHttpRequest.prototype.getResponseHeader = function(key){
	return "";
}

XMLHttpRequest.prototype.send = function(data) {
	// derive the XHR settings object from the XHR object
	var xhrSettings = {
		url: this.url,
		data: data,
		headers: this._headers,
		type: this.type.toLowerCase() || 'get'
	};
	if(!xhrSettings.data && xhrSettings.type === "get" || xhrSettings.type === "delete") {
		xhrSettings.data = deparam( xhrSettings.url.split("?")[1] );
		xhrSettings.url = xhrSettings.url.split("?")[0];
	}
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
			mockXHR.onreadystatechange && mockXHR.onreadystatechange({ target: mockXHR });
			mockXHR.onload && mockXHR.onload();
		});
	}
	// Make a realXHR object based around the settings of the mockXHR.
	var xhr = makeXHR(this);
	if(fixtureSettings) {
		// we need to modify the XHR object to send with `fixtureSettings`.
		//!steal-remove-start
		fixtureCore.log(xhrSettings.url+" -> " + fixtureSettings.url);
		//!steal-remove-end
		helpers.extend(xhr, fixtureSettings);
	}

	this._xhr = xhr;
	xhr.open(xhr.type, xhr.url);
	return xhr.send(data);
};

/**
 * Call all of an event for an XHR object
 */
function callEvents(xhr, ev) {
	var evs = xhr.__events[ev] || [], fn;
	for(var i = 0, len = evs.length; i < len; i++) {
		fn = evs[i];
		fn.call(xhr);
	}
}

var copyProps = function(source, dest, excluding){
	excluding = excluding || {};

	// copy everything on this to the xhr object that is not on `this`'s prototype
	for(var prop in source){
		if(!( prop in XMLHttpRequest.prototype) && !excluding[prop] ) {
			dest[prop] = source[prop];
		}
	}
};

var makeXHR = function(mockXHR){
	var xhr = new XHR();

	copyProps(mockXHR, xhr);

	xhr.onreadystatechange = function(ev){
		if(xhr.readyState === 4) {
			// Copy back everything over because in IE8 defineProperty
			// doesn't work, so we need to make our shim XHR have the same
			// values as the real xhr.
			copyProps(xhr, mockXHR, { onreadystatechange: true, onload: true });

			mockXHR.onreadystatechange && mockXHR.onreadystatechange(ev);
		}
	};

	xhr.onload = function(){
		callEvents(mockXHR, "load");
		if(mockXHR.onload) {
			return mockXHR.onload.apply(mockXHR, arguments);
		}
	};

	if(mockXHR._disableHeaderCheck && xhr.setDisableHeaderCheck) {
		xhr.setDisableHeaderCheck(true);
	}

	if(xhr.getResponseHeader) {
		mockXHR.getResponseHeader = function(){
			return xhr.getResponseHeader.apply(xhr, arguments);
		};
	}
	return xhr;
};
