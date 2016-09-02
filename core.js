// Adds
var canSet = require("can-set");
var sub = require("can-util/js/string/string").sub;
var each = require("can-util/js/each/each");
var assign = require("can-util/js/assign/assign");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");
require("./store");



var fixtures = [];
exports.fixtures = fixtures;

// Adds a fixture to the list of fixtures.
exports.add = function (settings, fixture) {
	// When a fixture is passed a store like:
	// `fixture("/things/{id}", store)`
	if(fixture && (fixture.getData || fixture.getListData)) {
		var root = settings,
			store = fixture,
			idProp = store.idProp,
			itemRegex = new RegExp('\\/\\{' + idProp+"\\}.*" ),
			rootIsItemUrl = itemRegex.test(root),
			getListUrl = rootIsItemUrl ? root.replace(itemRegex, "") : root,
			getItemUrl = rootIsItemUrl ? root : (root.trim() + "/{" + idProp + "}");
		fixture = undefined;
		settings = {};
		settings["GET "+getItemUrl] = store.getData;
		settings["DELETE "+getItemUrl] = store.destroyData;
		settings["PUT "+getItemUrl] = store.updateData;
		settings["GET "+getListUrl] = store.getListData;
		settings["POST "+getListUrl] = store.createData;
	}

	// If fixture is provided, set up a new fixture.
	if (fixture !== undefined) {

		if (typeof settings === 'string') {

			// Match URL if it has GET, POST, PUT, DELETE or PATCH.
			var matches = settings.match(/(GET|POST|PUT|DELETE|PATCH) (.+)/i);
			// If not, we don't set the type, which eventually defaults to GET
			if (!matches) {
				settings = {
					url: settings
				};
				// If it does match, we split the URL in half and create an object with
				// each half as the url and type properties.
			} else {
				settings = {
					url: matches[2],
					type: matches[1]
				};
			}
		}


		// Check if the same fixture was previously added, if so, we remove it
		// from our array of fixture overwrites.
		var index = exports.index(settings, true);

		if (index > -1) {
			fixtures.splice(index, 1);
		}
		if (fixture == null) {
			return;
		}
		if(typeof fixture === "object") {
			var data = fixture;
			fixture = function(){
				return data;
			};
		}
		settings.fixture = fixture;
		fixtures.unshift(settings);

	}
	// If a fixture isn't provided, we assume that settings is
	// an array of fixtures, and we should iterate over it, and set up
	// the new fixtures.
	else {
		each(settings, function (fixture, url) {
			exports.add(url, fixture);
		});
	}
};

var $fixture = exports.add;
$fixture.on = true;
$fixture.delay =10;


// Calls a dynamic fixture and calls `cb` with the response data.
exports.callDynamicFixture = function(xhrSettings, fixtureSettings, cb){
	// this is for legacy.  In the future, people should get it from fixtureSettings probably.
	xhrSettings.data = fixtureSettings.data;

	//!steal-remove-start
	var json = JSON.stringify(xhrSettings.data);
	exports.log("" + xhrSettings.type.toUpperCase() + " " + xhrSettings.url+" "+json.substr(0,50)+" -> handler(req,res)");
	//!steal-remove-end

	var response = function(){
		var res = exports.extractResponse.apply(xhrSettings, arguments);
		return cb.apply(this, res);
	};
	var callFixture = function () {
		// fall the fixture
		var result = fixtureSettings.fixture(xhrSettings, response, xhrSettings.headers, fixtureSettings);

		if (result !== undefined) {
			// Resolve with fixture results
			response(200, result );
		}
	};

	if(!xhrSettings.async) {
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
exports.get = function(xhrSettings) {
	if ( !$fixture.on ) {
		return;
	}
	// First try an exact match
	var index = exports.index(xhrSettings, true);

	// If that doesn't work, try a looser match.
	if(index === -1) {
		index = exports.index(xhrSettings, false);
	}

	var fixtureSettings = index >=0 ? assign({},fixtures[index]) : undefined;
	if(fixtureSettings) {
		var url = fixtureSettings.fixture,
			data = exports.dataFromUrl(fixtureSettings.url, xhrSettings.url);
		if(typeof fixtureSettings.fixture === "string") {
			// check that we might have a replacement

			// here we could read data from first url and translate into next
			if (data) {
				// Template static fixture URLs
				url = sub(url, data);
			}

			// Override the AJAX settings, changing the URL to the fixture file,
			// removing the data, and changing the type to GET.
			fixtureSettings.url = url;
			fixtureSettings.data = null;
			fixtureSettings.type = "GET";
			if (!fixtureSettings.error) {
				// If no error handling is provided, we provide one and throw an
				// error.
				fixtureSettings.error = function (xhr, error, message) {
					throw "fixtures.js Error " + error + " " + message;
				};
			}
		} else {
			var xhrData = assign({}, xhrSettings.data || {});
			fixtureSettings.data = assign(xhrData, data);
		}
	}


	return fixtureSettings;
};

exports.matches = function(settings, fixture, exact) {
	if (exact) {
		return canSet.equal(settings, fixture, {fixture: function(){ return true; }});
	} else {
		return canSet.subset(settings, fixture, exports.defaultCompare);
	}
};
var isEmptyOrNull = function(a, b){
	if( a == null && isEmptyObject(b) ) {
		return true;
	} else if( b == null && isEmptyObject(a) ) {
		return true;
	} else {
		return canSet.equal(a, b);
	}
};
var isEmptyOrSubset = function(a, b) {
	if( a == null && isEmptyObject(b) ) {
		return true;
	} else if( b == null && isEmptyObject(a) ) {
		return true;
	} else {
		return canSet.subset(a, b);
	}
};

// Comparator object used to find a similar fixture.
exports.defaultCompare = {
	url: function (a, b) {
		return !!exports.dataFromUrl(b, a);
	},
	fixture: function(){
		return true;
	},
	xhr: function(){
		return true;
	},
	type: function(a,b){
		return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
	},
	method: function(a,b){
		return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
	},
	helpers: function(){
		return true;
	},
	headers: isEmptyOrNull,
	data: isEmptyOrSubset
};

var replacer =  /\{([^\}]+)\}/g;
// Returns data from a url, given a fixtue URL. For example, given
// "todo/{id}" and "todo/5", it will return an object with an id property
// equal to 5.
exports.dataFromUrl = function (fixtureUrl, url) {
	if(!fixtureUrl) {
		// if there's no url, it's a match
		return {};
	}

	var order = [],
		// Sanitizes fixture URL
		fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.')
			.replace('?', '\\?'),
		// Creates a regular expression out of the adjusted fixture URL and
		// runs it on the URL we passed in.
		res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
			order.push(part);
			return "([^\/]+)";
		}) + "$")
			.exec(url),
		data = {};

	// If there were no matches, return null;
	if (!res) {
		return null;
	}

	// Shift off the URL and just keep the data.
	res.shift();
	each(order, function (name) {
		// Add data from regular expression onto data object.
		data[name] = res.shift();
	});
	return data;
};



// A helper function that takes what's called with response
// and moves some common args around to make it easier to call
exports.extractResponse = function (status, response, headers, statusText) {
	// if we get response(RESPONSE, HEADERS)
	if (typeof status !== "number") {
		headers = response;
		response = status;
		status = 200;
	}
	// if we get response(200, RESPONSE, STATUS_TEXT)
	if (typeof headers === "string") {
		statusText = headers;
		headers = {};
	}
	return [status, response, headers, statusText];
};

// A simple wrapper for logging fixture.js.
exports.log = function () {
	//!steal-remove-start
	console.log('can-fixture: ' + Array.prototype.slice.call(arguments)
		.join(' '));
	//!steal-remove-end
};
