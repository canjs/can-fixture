var canSet = require("can-set");
var helpers = canSet.helpers;
// Attemps to guess where the id is in an AJAX call's URL and returns it.
var getId = function (settings) {
	var id = settings.data.id;

	if (id === undefined && typeof settings.data === "number") {
		id = settings.data;
	}

	// Parses the URL looking for all digits
	if (id === undefined) {
		// Set id equal to the value
		settings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
			id = num;
		});
	}

	if (id === undefined) {
		// If that doesn't work Parses the URL looking for all words
		id = settings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
			// As long as num isn't the word "update", set id equal to the value
			if (num !== 'update') {
				id = num;
			}
		});
	}

	if (id === undefined) {
		// If id is still not set, a random number is guessed.
		id = Math.round(Math.random() * 1000);
	}

	return id;
};

// ## fixture.store
// Make a store of objects to use when making requests against fixtures.
module.exports = function (count, make, filter) {
	/*jshint eqeqeq:false */

	// the currentId to use when a new instance is created.
	var	currentId = 0,
		findOne = function (id) {
			for (var i = 0; i < items.length; i++) {
				if (id == items[i].id) {
					return items[i];
				}
			}
		},
		methods = {},
		types,
		items,
		reset;

	if(helpers.isArrayLike(count) && typeof count[0] === "string" ){
		types = count;
		count = make;
		make= filter;
		filter = arguments[3];
	} else if(typeof count === "string") {
		types = [count + "s", count];
		count = make;
		make= filter;
		filter = arguments[3];
	}


	if(typeof count === "number") {
		items = [];
		reset = function () {
			items = [];
			for (var i = 0; i < (count); i++) {
				//call back provided make
				var item = make(i, items);

				if (!item.id) {
					item.id = i;
				}
				currentId = Math.max(item.id + 1, currentId + 1) || items.length;
				items.push(item);
			}
			if (helpers.isArrayLike(types)) {
				fixture["~" + types[0]] = items;
				fixture["-" + types[0]] = methods.getListData;
				fixture["-" + types[1]] = methods.getData;
				fixture["-" + types[1] + "Update"] = methods.updateData;
				fixture["-" + types[1] + "Destroy"] = methods.destroyData;
				fixture["-" + types[1] + "Create"] = methods.createData;
			}
		};
	} else {
		filter = make;
		var initialItems = count;
		reset = function(){
			items = initialItems.slice(0);
		};
	}


	// make all items
	helpers.extend(methods, {
		getListData: function (request) {

			request = request || {};
			//copy array of items
			var retArr = items.slice(0);
			request.data = request.data || {};
			//sort using order
			//order looks like ["age ASC","gender DESC"]
			helpers.each((request.data.order || [])
				.slice(0)
				.reverse(), function (name) {
					var split = name.split(" ");
					retArr = retArr.sort(function (a, b) {
						if (split[1].toUpperCase() !== "ASC") {
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

			//group is just like a sort
			helpers.each((request.data.group || [])
				.slice(0)
				.reverse(), function (name) {
					var split = name.split(" ");
					retArr = retArr.sort(function (a, b) {
						return a[split[0]] > b[split[0]];
					});
				});

			var offset = parseInt(request.data.offset, 10) || 0,
				limit = parseInt(request.data.limit, 10) || (items.length - offset),
				i = 0;

			//filter results if someone added an attr like parentId
			for (var param in request.data) {
				i = 0;

				if (request.data[param] !== undefined && // don't do this if the value of the param is null (ignore it)
					(param.indexOf("Id") !== -1 || param.indexOf("_id") !== -1)) {
					while (i < retArr.length) {
						if (request.data[param] != retArr[i][param]) { // jshint eqeqeq: false
							retArr.splice(i, 1);
						} else {
							i++;
						}
					}
				}
			}

			if ( typeof filter === "function" ) {
				i = 0;
				while (i < retArr.length) {
					if (!filter(retArr[i], request)) {
						retArr.splice(i, 1);
					} else {
						i++;
					}
				}
			} else if( typeof filter === "object" ) {
				i = 0;
				while (i < retArr.length) {
					var subset = canSet.subset(retArr[i], request.data, filter);
					if ( !subset ) {
						retArr.splice(i, 1);
					} else {
						i++;
					}
				}
			}
			// Return the data spliced with limit and offset, along with related values
			// (e.g. count, limit, offset)
			var responseData = {
				"count": retArr.length,
				"data": retArr.slice(offset, offset + limit)
			};
			helpers.each(["limit","offset"], function(prop){
				if(prop in request.data) {
					responseData[prop] = request.data[prop];
				}
			});


			return responseData;
		},

		/**
		 * @description Simulate a findOne request on a fixture.
		 * @function fixture.types.Store.findOne
		 * @parent fixture.types.Store
		 * @signature `store.findOne(request, response)`
		 * @param {Object} request Parameters for the request.
		 * @param {Function} response A function to call with the retrieved item.
		 *
		 * @body
		 * `store.findOne(request, response(item))` simulates a request to
		 * get a single item from the server by id.
		 *
		 *     todosStore.findOne({
		 *       url: "/todos/5"
		 *     }, function(todo){
		 *
		 *     });
		 *
		 */
		getData: function (request, response) {
			var item = findOne(getId(request));

			if(typeof item === "undefined") {
				return response(404, 'Requested resource not found');
			}

			response(item);
		},
		// ## fixtureStore.update
		// Simulates a Model.update to a fixture
		updateData: function (request, response) {
			var id = getId(request),
				item = findOne(id);

			if(typeof item === "undefined") {
				return response(404, 'Requested resource not found');
			}

			// TODO: make it work with non-linear ids ..
			helpers.extend(item, request.data);
			response({
				id: id
			}, {
				location: request.url || "/" + getId(request)
			});
		},

		/**
		 * @description Simulate destroying a Model on a fixture.
		 * @function fixture.types.Store.destroy
		 * @parent fixture.types.Store
		 * @signature `store.destroy(request, callback)`
		 * @param {Object} request Parameters for the request.
		 * @param {Function} callback A function to call after destruction.
		 *
		 * @body
		 * `store.destroy(request, response())` simulates
		 * a request to destroy an item from the server.
		 *
		 * ```
		 * todosStore.destroy({
		 *   url: "/todos/5"
		 * }, function(){});
		 * ```
		 */
		destroyData: function (request, response) {
			var id = getId(request),
				item = findOne(id);

			if(typeof item === "undefined") {
				return response(404, 'Requested resource not found');
			}

			for (var i = 0; i < items.length; i++) {
				if (items[i].id == id) {  // jshint eqeqeq: false
					items.splice(i, 1);
					break;
				}
			}

			// TODO: make it work with non-linear ids ..
			return {};
		},

		// ## fixtureStore.create
		// Simulates a Model.create to a fixture
		createData: function (settings, response) {
			var item = typeof make === 'function' ? make(items.length, items) : {};

			helpers.extend(item, settings.data);

			// If an ID wasn't passed into the request, we give the item
			// a unique ID.
			if (!item.id) {
				item.id = currentId++;
			}

			// Push the new item into the store.
			items.push(item);
			response({
				id: item.id
			}, {
				location: settings.url + "/" + item.id
			});
		}
	});
	reset();
	// if we have types given add them to fixture

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
