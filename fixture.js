var core = require("./core");
var fixture = core.add;
var helpers = require("can-set").helpers;
var store = require("./store");
require("./xhr");
// HELPERS START

var noop = function(){};

helpers.extend(fixture, {
	rand: function randomize(arr, min, max) {
		if (typeof arr === 'number') {
			if (typeof min === 'number') {
				return arr + Math.floor(Math.random() * (min - arr));
			} else {
				return Math.floor(Math.random() * arr);
			}

		}
		var rand = randomize;
		// get a random set
		if (min === undefined) {
			return rand(arr, rand(arr.length + 1));
		}
		// get a random selection of arr
		var res = [];
		arr = arr.slice(0);
		// set max
		if (!max) {
			max = min;
		}
		//random max
		max = min + Math.round(rand(max - min));
		for (var i = 0; i < max; i++) {
			res.push(arr.splice(rand(arr.length), 1)[0]);
		}
		return res;
	},
	xhr: function (xhr) {
		return helpers.extend({}, {
			abort: noop,
			getAllResponseHeaders: function () {
				return "";
			},
			getResponseHeader: function () {
				return "";
			},
			open: noop,
			overrideMimeType: noop,
			readyState: 4,
			responseText: "",
			responseXML: null,
			send: noop,
			setRequestHeader: noop,
			status: 200,
			statusText: "OK"
		}, xhr);
	},
	store: store,
	fixtures: core.fixtures
});

module.exports = fixture;
