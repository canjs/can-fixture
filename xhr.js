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

XMLHttpRequest.prototype.send = function(data) {
	var settings = {
		url: this.url,
		data: data,
		headers: this._headers,
		type: this.type.toLowerCase()
	};
	if(!settings.data && settings.type === "get" || settings.type === "delete") {
		settings.data = deparam( settings.url.split("?")[1] );
		settings.url = settings.url.split("?")[0];
	}
	if(typeof settings.data === "string") {
		try {
			settings.data = JSON.parse(settings.data);
		} catch(e) {
			settings.data = deparam( settings.data );
		}

	}

	var self = this;

	var fixture = fixtureCore.updateSettingsOrReturnFixture(settings);

	// If the call is a fixture call, we run the same type of code as we would
	// with jQuery's ajaxTransport.
	if (fixture) {
		var timeout,
			stopped = false;

		// set a timeout that simulates making a request ....
		timeout = setTimeout(function () {
			// if the user wants to call success on their own, we allow it ...
			var success = function () {
				var response = extractResponse.apply(settings, arguments),
					status = response[0];

				helpers.extend(self,{
					readyState: 4,
					status: status
				});
				if ((status >= 200 && status < 300 || status === 304) && stopped === false) {
					helpers.extend({
						statusText: "OK",
						responseText: JSON.stringify(response[2][settings.dataType || 'json'])
					});
				} else {
					helpers.extend({
						statusText: "error",
						responseText: typeof response[1] === "string" ? response[1] : JSON.stringify(response[1])
					});
					self.statusText = "error";
				}
				self.onreadystatechange && self.onreadystatechange({ target: self });
				self.onload && self.onload();
			},
				// Get the results from the fixture.
				result = fixture(settings, success, settings.headers, settings);

			if (result !== undefined) {
				// Resolve with fixture results
				success(200, "success", result );
			}
		}, fixtureCore.add.delay);

		// Otherwise just run a normal ajax call.
	} else {

		var xhr = new XHR();

		var copyProps = function(source, dest, excluding){
			excluding = excluding || {};

			// copy everything on this to the xhr object that is not on `this`'s prototype
			for(var prop in source){
				if(!( prop in XMLHttpRequest.prototype) && !excluding[prop] ) {
					dest[prop] = source[prop];
				}
			}
		};
		copyProps(this, xhr);

		xhr.onreadystatechange = function(ev){
			if(xhr.readyState === 4) {
				// Copy back everything over because in IE8 defineProperty
				// doesn't work, so we need to make our shim XHR have the same
				// values as the real xhr.
				copyProps(xhr, self, { onreadystatechange: true });

				self.onreadystatechange && self.onreadystatechange(ev);
				if(self.onload && !xhr.__onloadCalled) {
					self.onload();
					xhr.__onloadCalled = true;
				}
			}
		};

		//helpers.extend(xhr, this);
		helpers.extend(xhr, settings);
		this._xhr = xhr;
		xhr.open(settings.type, settings.url);
		return xhr.send(data);
	}
};
