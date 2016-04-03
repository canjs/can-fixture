var canSet = require("can-set");
var helpers = canSet.helpers;
var sub = require("./helpers/sub");
var fixtures = [];
exports.fixtures = fixtures;

// This becomes the fixture function
exports.add = function (settings, fixture) {
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
		var index = exports.index(settings, !! fixture);
		if (index > -1) {
			overwrites.splice(index, 1);
		}
		if (fixture == null) {
			return;
		}
		settings.fixture = fixture;
		fixtures.push(settings);

	}
	// If a fixture isn't provided, we assume that settings is
	// an array of fixtures, and we should iterate over it, and set up
	// the new fixtures.
	else {
		helpers.each(settings, function (fixture, url) {
			$fixture(url, fixture);
		});
	}
};
var $fixture = exports.add;
$fixture.on = true;
$fixture.delay =10;

// Manipulates the AJAX prefilter to identify whether or not we should
// manipulate the AJAX call to change the URL to a static file or call
// a function for a dynamic fixture.
exports.updateSettingsOrReturnFixture = function ( settings ) {
	if ( !$fixture.on ) {
		return;
	}

	// We always need the type which can also be called method, default to GET
	settings.type = settings.type || settings.method || 'GET';

	// add the fixture option if programmed in
	var fixture = exports.get(settings);

	// If there is not a fixture for this AJAX request, do nothing.
	if (!fixture) {
		return;
	}

	// If the fixture setting is a string, we just change the URL of the
	// AJAX call to the fixture URL.
	if (typeof fixture === "string") {
		var url = fixture;

		// If the URL starts with //, we need to update the URL to become
		// the full path.
		if (/^\/\//.test(url)) {
			// this lets us use rootUrl w/o having steal...
			url = getUrl(fixture.substr(2));
		}
		// here we could read data from first url and translate into next
		//if (data) {
			// Template static fixture URLs
		//	url = sub(url, data);
		//}

		//!steal-remove-start
		log("looking for fixture in " + url);
		//!steal-remove-end

		// Override the AJAX settings, changing the URL to the fixture file,
		// removing the data, and changing the type to GET.
		settings.url = url;
		settings.data = null;
		settings.type = "GET";
		if (!settings.error) {
			// If no error handling is provided, we provide one and throw an
			// error.
			settings.error = function (xhr, error, message) {
				throw "fixtures.js Error " + error + " " + message;
			};
		}
		// Otherwise, it is a function and we add the fixture data type so the
		// fixture transport will handle it.
	} else {
		//!steal-remove-start
		log("using a dynamic fixture for " + settings.type + " " + settings.url);
		//!steal-remove-end

		return fixture;
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
exports.get = function(settings, exact) {
	var index = exports.index(settings, exact);
	return index >=0 ? fixtures[index].fixture : undefined;
};



exports.matches = function(settings, fixture, exact) {
	if (exact) {
		return canSet.equal(settings, fixture, {
			fixture: function(){ return true; }
		});
	} else {
		return canSet.subset(settings, fixture, exports.defaultCompare);
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
	type: function(a,b){
		return b ? a.toLowerCase() === b.toLowerCase() : false;
	},
	helpers: function(){
		return true;
	}
};

var replacer =  /\{([^\}]+)\}/g;
// Returns data from a url, given a fixtue URL. For example, given
// "todo/{id}" and "todo/5", it will return an object with an id property
// equal to 5.
exports.dataFromUrl = function (fixtureUrl, url) {
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
	helpers.each(order, function (name) {
		// Add data from regular expression onto data object.
		data[name] = res.shift();
	});
	return data;
};



// A helper function that takes what's called with response
// and moves some common args around to make it easier to call
exports.extractResponse = function (status, statusText, responses, headers) {
	// if we get response(RESPONSES, HEADERS)
	if (typeof status !== "number") {
		headers = statusText;
		responses = status;
		statusText = "success";
		status = 200;
	}
	// if we get response(200, RESPONSES, HEADERS)
	if (typeof statusText !== "string") {
		headers = responses;
		responses = statusText;
		statusText = "success";
	}
	if (status >= 400 && status <= 599) {
		this.dataType = "text";
	}
	return [status, statusText, exports.extractResponses(this, responses), headers];
},
// If we get data instead of responses, make sure we provide a response
// type that matches the first datatype (typically JSON)
exports.extractResponses = function (settings, responses) {
	var next = settings.dataTypes ? settings.dataTypes[0] : (settings.dataType || 'json');
	if (!responses || !responses[next]) {
		var tmp = {};
		tmp[next] = responses;
		responses = tmp;
	}
	return responses;
};

// A simple wrapper for logging fixture.js.
var log = function () {
	//!steal-remove-start
	console.log('can-fixture ' + Array.prototype.slice.call(arguments)
		.join(' '));
	//!steal-remove-end
};
// used to get a url relative to some established root.
var getUrl = function (url) {
	if (typeof steal !== 'undefined') {
		// New steal
		// TODO The correct way to make this work with new Steal is to change getUrl
		// to return a deferred and have the other code accept a deferred.
		if(steal.joinURIs) {
			var base = steal.config("baseUrl");
			var joined = steal.joinURIs(base, url);
			return joined;
		}

		// Legacy steal
		if (typeof steal.config === "function") {
			if (steal.System) {
				return steal.joinURIs(steal.config('baseURL'), url);
			}
			else {
				return steal.config()
					.root.mapJoin(url)
					.toString();
			}
		}
		return steal.root.join(url)
			.toString();
	}
	return (fixture.rootUrl || '') + url;
};
