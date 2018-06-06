require("./matches-test");
require("./store-test");

var QUnit = require('steal-qunit');
var fixture = require("can-fixture");
var set = require("can-set-legacy");
var $ = require("jquery");
var canDev = require('can-log/dev/dev');
var dataFromUrl = require("../data-from-url");
var canReflect = require("can-reflect");
var matches = require("../matches");
var QueryLogic = require("can-query-logic");


var errorCallback = function(xhr, status, error){
	ok(false, error);
	start();
};

var parseHeaders = function(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = line.slice(index + 1).replace(/(^\s*|\s*$)/g, '');
    fields[field] = val;
  }

  return fields;
}

QUnit.module('can-fixture');

if (__dirname !== '/') {
	test('static fixtures', function () {
		stop();
		fixture('GET something', __dirname+'/fixtures/test.json');
		fixture('POST something', __dirname+'/fixtures/test.json');
		fixture('PATCH something', __dirname+'/fixtures/test.json');

		$.ajax({
			url: 'something',
			dataType: 'json'
		})
			.then(function (data) {
				equal(data.sweet, 'ness', 'can.get works');
				$.ajax({
					url: 'something',
					method: 'POST',
					dataType: 'json'
				})
					.then(function (data) {
						equal(data.sweet, 'ness', 'can.post works');
							$.ajax({
						url: 'something',
						method: 'PATCH',
						dataType: 'json'
					})
						.then(function (data) {
							equal(data.sweet, 'ness', 'can.patch works');
							start();
						},errorCallback);
					},errorCallback);
			}, errorCallback);
	});
}

if (__dirname !== '/') {
	test('static fixtures (using method signature)', function () {
		stop();
		fixture({method: 'get', url: 'method/{id}'}, __dirname+'/fixtures/method.{id}.json');
		$.ajax({
			url: 'method/4',
			dataType: 'json'
		})
			.then(function (data) {
				equal(data.id, 4, 'Got data with proper id using method');
				start();
			}, errorCallback);
	});
}

if (__dirname !== '/') {
	test('static fixtures (using type signature)', function () {
		stop();
		fixture({type: 'get', url: 'type/{id}'}, __dirname+'/fixtures/type.{id}.json');
		$.ajax({
			url: 'type/4',
			dataType: 'json'
		})
			.then(function (data) {
				equal(data.id, 4, 'Got data with proper id using type');
				start();
			}, errorCallback);
	});
}

if (__dirname !== '/') {
	test('templated static fixtures', function () {
		stop();
		fixture('GET some/{id}', __dirname+'/fixtures/stuff.{id}.json');
		$.ajax({
			url: 'some/3',
			dataType: 'json'
		})
			.then(function (data) {
				equal(data.id, 3, 'Got data with proper id');
				start();
			}, errorCallback);
	});
}

test('dynamic fixtures', function () {
	stop();
	fixture.delay = 10;
	fixture('something', function () {
		return [{
			sweet: 'ness'
		}];
	});
	$.ajax({
		url: 'something',
		dataType: 'json'
	})
		.done(function (data) {
			equal(data[0].sweet, 'ness', 'can.get works');
			start();
		}).catch(function(err){
			debugger;
		});
});

if (__dirname !== '/') {
	test('fixture function', 3, function () {
		stop();
		var url = __dirname+'/fixtures/foo.json';
		fixture(url, __dirname+'/fixtures/foobar.json');
		$.ajax({
			url: url,
			dataType: 'json'
		})
			.done(function (data) {
				equal(data.sweet, 'ner', 'url passed works');
				fixture(url, __dirname+'/fixtures/test.json');
				$.ajax({
					url: url,
					dataType: 'json'
				})
					.done(function (data) {
						equal(data.sweet, 'ness', 'replaced');
						fixture(url, null);
						$.ajax({
							url: url,
							dataType: 'json'
						})
							.done(function (data) {
								equal(data.a, 'b', 'removed');
								start();
							});
					});
			});
	});
}

test('fixture.store fixtures', function () {
	stop();

	var SearchText = matches.makeComparatorType(function(searchTextValue, dataSearchTextValue, data, path){
		var regex = new RegExp('^' + searchTextValue);
		return regex.test(data.name);
	});


	var algebra = new set.Algebra({
		schema: function(schema) {

			schema.keys.searchText = SearchText;
		}
	},
		set.props.offsetLimit("offset","limit"),
		set.props.sort("order"));


	var store = fixture.store(1000, function (i) {
		return {
			id: i,
			name: 'thing ' + i
		};
	}, algebra);
	fixture('things', store.getListData);

	$.ajax({
		url: 'things',
		dataType: 'json',
		data: {
			offset: 100,
			limit: 200,
			order: 'name ASC',
			searchText: 'thing 2'
		},
		success: function (things) {
			equal(things.data[0].name, 'thing 29', 'first item is correct');
			equal(things.data.length, 11, 'there are 11 items');
			start();
		}
	});
});

test('fixture.store fixtures should have unique IDs', function () {
	stop();
	var store = fixture.store(100, function (i) {
		return {name: 'Test ' + i};
	});
	fixture('things', store.getListData);

	$.ajax({
		url: 'things',
		dataType: 'json',
		data: {
			page: {start: 0, end: 199},
			order: 'name ASC'
		},
		success: function (result) {
			var seenIds = [];
			var things = result.data;
			for (var thingKey in things) {
				var thing = things[thingKey];
				ok(seenIds.indexOf(thing.id) === -1);
				seenIds.push(thing.id);
			}
			start();
		}
	});
});

test('fixture.store should assign unique IDs when fixtures provide IDs', function () {
	/* NOTE: We are testing whether the unique ID we are assigning to a new
	         item will account for IDs which the user has provided.
	*/

	/* NOTE: These integers are used because IDs are created sequentially from 0.
	         Here, 0 1 and 2 must be skipped because they exist already.
	         If the implementation is changed this test will need updated.
	*/
	var store = fixture.store([
		{id: 0, name: 'Object 0'},
		{id: 1, name: 'Object 1'},
		{id: 2, name: 'Object 2'}
	]);

	fixture('POST /models', store.createData);

	function then (ajax, callback) {
		ajax.then(callback, function (error) {
			ok(false, 'ajax failure: ' + error);
			start();
		});
	}

	var request = $.ajax({
		url: '/models',
		dataType: 'json',
		type: 'post',
		data: {
			name: 'My test object'
		}
	});

	stop();
	then(request, function (response) {
		notEqual(response.id, 0);
		notEqual(response.id, 1);
		notEqual(response.id, 2);

		/* NOTE: This check will fail if the underlying implementation changes.
		         This 3 is tightly coupled to the implementation.
		         If this is the only breaking assertion, update the provided IDs to
		         properly test the edge-case and update these assertions.
		         This check only serves to notify you to update the checks.
		*/
		equal(response.id, 3);

		start();
	});
});

test('simulating an error', function () {

	fixture('/foo', function (request, response) {
		return response(401, {type: "unauthorized"});
	});
	stop();
	$.ajax({
		url: '/foo',
		dataType: 'json'
	})
		.done(function () {
			ok(false, 'success called');
			start();
		})
		.fail(function (original, type) {
			ok(true, 'error called');
			deepEqual(JSON.parse(original.responseText), {type: "unauthorized"}, 'Original text passed');
			start();
		});
});

test('rand', function () {
	var rand = fixture.rand;
	var num = rand(3);
	equal(typeof num, 'number');
	var matched = {};
	// this could ocassionally fail.
	for(var i = 0; i < 100; i++) {
		num = rand(3);
		matched[num] = true;
	}
	for(i = 0; i <= 3; i++) {
		ok(matched[i], "has "+i);
	}

	matched = {};
	var result,
		choices = ["a","b","c"];

	// makes sure we have the right length arrays and
	// every item can be first
	for(i = 0; i < 100; i++) {
		result = rand(choices);
		matched[result.length] = true;
		matched[result[0]] = true;
	}

	for(i = 1; i <= 3; i++) {
		ok(matched[i], "has "+i);
		delete matched[i];
	}

	choices.forEach(function(choice){
		ok(matched[choice], "has "+choice);
		delete matched[choice];
	});

	ok(canReflect.size(matched) === 0, "nothing else unexpected");
});

test('dataFromUrl', function () {
	var data = dataFromUrl('/thingers/{id}', '/thingers/5');
	equal(data.id, 5, 'gets data');
	data = dataFromUrl('/thingers/5?hi.there', '/thingers/5?hi.there');
	deepEqual(data, {}, 'gets data');
});

test('core.dataFromUrl with double character value', function () {
	var data = dataFromUrl('/days/{id}/time_slots.json', '/days/17/time_slots.json');
	equal(data.id, 17, 'gets data');
});



test('fixture function gets id', function () {
	fixture('/thingers/{id}', function (settings) {
		return {
			id: settings.data.id,
			name: 'justin'
		};
	});
	stop();
	$.ajax({
		url: '/thingers/5',
		dataType: 'json',
		data: {
			id: 5
		}
	})
		.done(function (data) {
			ok(data.id);
			start();
		});
});

if (__dirname !== '/') {
	test('replacing and removing a fixture', function () {
		var url = __dirname+'/fixtures/remove.json';
		fixture('GET ' + url, function () {
			return {
				weird: 'ness!'
			};
		});
		stop();
		$.ajax({
			url: url,
			dataType: 'json'
		})
			.done(function (json) {
				equal(json.weird, 'ness!', 'fixture set right');
				fixture('GET ' + url, function () {
					return {
						weird: 'ness?'
					};
				});
				$.ajax({
					url: url,
					dataType: 'json'
				})
					.done(function (json) {
						equal(json.weird, 'ness?', 'fixture set right');
						fixture('GET ' + url, null);
						$.ajax({
							url: url,
							dataType: 'json'
						})
							.done(function (json) {
								equal(json.weird, 'ness', 'fixture set right');
								start();
							});
					});
			});
	});
}

test('fixture.store with can.Model', function () {
	var store = fixture.store(100, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	})/*,
		Model = can.Model.extend({
			findAll: 'GET /models',
			findOne: 'GET /models/{id}',
			create: 'POST /models',
			update: 'PUT /models/{id}',
			destroy: 'DELETE /models/{id}'
		}, {})*/;

	fixture('GET /models', store.getListData);
	fixture('GET /models/{id}', store.getData);
	fixture('POST /models', store.createData);
	fixture('PUT /models/{id}', store.updateData);
	fixture('DELETE /models/{id}', store.destroyData);

	stop();
	function errorAndStart(e){
		ok(false, "borked"+e);
		start();
	}


	var check100Updated = function(){
		return $.ajax({
			url: "/models/100",
			dataType: 'json'
		}).then(function(model){
			equal(model.name, 'Updated test object', 'Successfully updated object');
		});
	};


	$.ajax({
		url: "/models",
		dataType: 'json'
	}).then(function (modelsData) {
		var models = modelsData.data;

		equal(models.length, 100, 'Got 100 models for findAll with no parameters');
		equal(models[95].name, 'Object 95', 'All models generated properly');
		return $.ajax({
				url: "/models/51",
				dataType: 'json'
			})
			.then(function (data) {
				equal(data.id, 51, 'Got correct object id');
				equal('Object 51', data.name, 'Object name generated correctly');
				return $.ajax({
						url: "/models",
						dataType: 'json',
						type: 'post',
						data: {
							name: 'My test object'
						}
					})
					.then(function (newmodel) {
						equal(newmodel.id, 100, 'Id got incremented');
						// Tests creating, deleting, updating
						return $.ajax({
								url: "/models/100",
								dataType: 'json'
							})
							.then(function (model) {
								equal(model.id, 100, 'Loaded new object');
								return $.ajax({
										url: "/models/100",
										dataType: 'json',
										type: 'put',
										data: {
											name: 'Updated test object'
										}
									})
									.then(function (model) {

										return check100Updated().then(function(){

											return $.ajax({
													url: "/models/100",
													dataType: 'json',
													type: 'delete'
												})
												.then(function (deleted) {
													start();
												},errorAndStart);

										}, errorAndStart);

									},errorAndStart);
							},errorAndStart);
					},errorAndStart);
			},errorAndStart);
	}, errorAndStart);
});

test('GET fixture.store returns 404 on findOne with bad id (#803)', function () {
	var store = fixture.store(2, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	fixture('GET /models/{id}', store.getData);
	stop();

	$.ajax({url: "/models/3", dataType: "json"}).then(function(){},function (data) {
		equal(data.status, 404, 'status');
		equal(data.statusText, 'error', 'statusText');
		equal(JSON.parse(data.responseText).title, 'no data', 'responseText');
		start();
	});
});

// problem here is that memory cache is cool with these changes.  We need to do something different
// if instance isn't there.
test('fixture.store returns 404 on update with a bad id (#803)', function () {
	var store = fixture.store(5, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	stop();
	fixture('POST /models/{id}', store.updateData);

	$.ajax({url: "/models/6", dataType: "json", data: {'jedan': 'dva'}, type: 'POST'})
		.then(function(){
			QUnit.ok(false, "success");
			QUnit.start();
		},function (data) {
			equal(data.status, 404, 'status');
			equal(data.statusText, 'error', 'statusText');
			equal(JSON.parse(data.responseText).title, 'no data', 'responseText');
			start();
		});
});

test('fixture.store returns 404 on destroy with a bad id (#803)', function () {
	var store = fixture.store(2, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	stop();

	fixture('DELETE /models/{id}', store.destroyData);

	$.ajax({url: "/models/6", dataType: "json", type: 'DELETE'})
		.then(function(){},function (data) {
			equal(data.status, 404, 'status');
			equal(data.statusText, 'error', 'statusText');
			equal(JSON.parse(data.responseText).title, 'no data', 'responseText');
			start();
		});
});

test('fixture.store can use id of different type (#742)', function () {

	var MustBeNumber = matches.makeComparatorType(function(queryVal, propVal){
		return parseInt(queryVal,10) === propVal;
	});

	var query = new QueryLogic({
		keys: {
			parentId: MustBeNumber
		}
	});

	var store = fixture.store(100, function (i) {
			return {
				id: i,
				parentId: i * 2,
				name: 'Object ' + i
			};
		}, query);
	fixture('GET /models', store.getListData);
	stop();
	$.ajax({url: "/models", dataType: "json", data: { filter: {parentId: '4'} } })
		.then(function (models) {
			equal(models.data.length, 1, 'Got one model');
			deepEqual(models.data[0], { id: 2, parentId: 4, name: 'Object 2' });
			start();
		});
});

test('fixture("METHOD /path", store) should use the right method', function () {
	/*
		Examples:
			fixture("GET /path", store) => fixture("GET /path", store.getData)
			fixture("POST /path", store) => fixture("GET /path", store.createData)
	*/

	// NOTE: this is a copy-paste of the test case
	//       "fixture.store can use id of different type (#742)"
	var store = fixture.store(100, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});
	fixture('GET /models', store); // <- CHANGE
	stop();
	$.ajax({url: "/models", dataType: "json"})
		.then(function (models) {
			equal(models.data.length, 100, 'Gotta catch up all!');
			start();
		});
});

//!steal-remove-start
test('fixture("METHOD /path", store) should warn when correcting to the right method', function (assert) {
	assert.expect(1);
	var store = fixture.store(100, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});
	var oldWarn = canDev.warn;
	canDev.warn = function (message) {
		assert.ok(typeof message === 'string');
	};
	fixture('GET /models', store); // <- CHANGE
	canDev.warn = oldWarn;
});
//!steal-remove-end

test('fixture with response callback', 4, function () {
	fixture.delay = 10;
	fixture('responseCb', function (orig, response) {
		response({
			sweet: 'ness'
		});
	});
	fixture('responseErrorCb', function (orig, response) {
		response(404, 'This is an error from callback');
	});
	stop();
	$.ajax({
		url: 'responseCb',
		dataType: 'json'
	})
		.done(function (data) {
			equal(data.sweet, 'ness', 'can.get works');
			start();
		});
	stop();
	$.ajax({
		url: 'responseErrorCb',
		dataType: 'json'
	})
		.fail(function (orig, error, text) {
			equal(error, 'error', 'Got error status');
			equal(orig.responseText, 'This is an error from callback', 'Got error text');
			start();
		});
	stop();
	fixture('cbWithTimeout', function (orig, response) {
		setTimeout(function () {
			response([{
				epic: 'ness'
			}]);
		}, 10);
	});
	$.ajax({
		url: 'cbWithTimeout',
		dataType: 'json'
	})
		.done(function (data) {
			equal(data[0].epic, 'ness', 'Got responsen with timeout');
			start();
		});
});

test('store create works with an empty array of items', function () {
	var store = fixture.store(0, function () {
		return {};
	});
	QUnit.stop();
	store.createData({
		data: {}
	}, function (responseData, responseHeaders) {
		equal(responseData.id, 1, 'the first id is 1');
		QUnit.start();
	});
});

QUnit.test('store creates sequential ids', function () {
	var store = fixture.store(0, function () {
		return {};
	});
	QUnit.stop();

	store.createData({
		data: {}
	}, function (responseData, responseHeaders) {
		equal(responseData.id, 1, 'the first id is 1');
		createSecond();
	})

	function createSecond(){
		store.createData({
			data: {}
		}, function (responseData, responseHeaders) {
			equal(responseData.id, 2, 'the second id is 2');
			destroyFirst();
		});
	}
	function destroyFirst(){
		store.destroyData({
			data: {
				id: 1
			}
		}, createThird);
	}

	function createThird(){
		store.createData({
			data: {}
		}, function (responseData, responseHeaders) {
			equal(responseData.id, 3, 'the third id is 3');
			QUnit.start();
		});
	}





});

test('fixture updates request.data with id', function() {
	expect(1);
	stop();


	fixture('foo/{id}', function(request) {
		equal(request.data.id, 5);
		start();
	});

	$.ajax({
		url: 'foo/5'
	});
});

test("create a store with array and comparison object",function(){

	var SoftEq = matches.makeComparatorType(function(a, b){
		/* jshint eqeqeq:false */
		return a == b;
	});


	var query = new QueryLogic({
		keys: {
			year: SoftEq,
			modelId: SoftEq
		}
	});

	var store = fixture.store([
		{id: 1, modelId: 1, year: 2013, name: "2013 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2012/07/01-2013-ford-mustang-gt-review-585x388.jpg"},
		{id: 2, modelId: 1, year: 2014, name: "2014 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2013/03/2014-roush-mustang.jpg"},
		{id: 2, modelId: 2, year: 2013, name: "2013 Focus", thumb: "http://images.newcars.com/images/car-pictures/original/2013-Ford-Focus-Sedan-S-4dr-Sedan-Exterior.png"},
		{id: 2, modelId: 2, year: 2014, name: "2014 Focus", thumb: "http://ipinvite.iperceptions.com/Invitations/survey705/images_V2/top4.jpg"},
		{id: 2, modelId: 3, year: 2013, name: "2013 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/04-2013-nissan-altima-1333416664.jpg"},
		{id: 2, modelId: 3, year: 2014, name: "2014 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 2, modelId: 4, year: 2013, name: "2013 Leaf", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 2, modelId: 4, year: 2014, name: "2014 Leaf", thumb: "http://images.thecarconnection.com/med/2013-nissan-leaf_100414473_m.jpg"}
	],query);


	fixture('GET /presetStore', store.getListData);
	stop();
	$.ajax({ url: "/presetStore", method: "get", data: {filter: {year: 2013, modelId:1} }, dataType: "json" }).then(function(response){

		equal(response.data[0].id, 1, "got the first item");
		equal(response.data.length, 1, "only got one item");
		start();
	});

});

QUnit.test("posting an empty data object", function(assert) {
	var done = assert.async();

	fixture("/data", function(req, res) {
		if (req.data == null) {
			throw new Error("req.data should be an empty object");
		} else {
			return {};
		}
	});

	var def = $.ajax({
		method: "post",
		url: "/data",
		dataType: "json",
		data: {}
	});

	def.then(function() {
		assert.ok(true, "works!");
		done();
	}, function(e) {
		assert.notOk(e, "should not fail");
	});
});

test("store with objects allows .create, .update and .destroy (#1471)", 4, function(){

	var store = fixture.store([
		{id: 1, modelId: 1, year: 2013, name: "2013 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2012/07/01-2013-ford-mustang-gt-review-585x388.jpg"},
		{id: 2, modelId: 1, year: 2014, name: "2014 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2013/03/2014-roush-mustang.jpg"},
		{id: 3, modelId: 2, year: 2013, name: "2013 Focus", thumb: "http://images.newcars.com/images/car-pictures/original/2013-Ford-Focus-Sedan-S-4dr-Sedan-Exterior.png"},
		{id: 4, modelId: 2, year: 2014, name: "2014 Focus", thumb: "http://ipinvite.iperceptions.com/Invitations/survey705/images_V2/top4.jpg"},
		{id: 5, modelId: 3, year: 2013, name: "2013 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/04-2013-nissan-altima-1333416664.jpg"},
		{id: 6, modelId: 3, year: 2014, name: "2014 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 7, modelId: 4, year: 2013, name: "2013 Leaf", thumb: "http://www.blogcdn.com/www.autoblog.com/media/201204/01-2013-nissan-altima-ny.jpg"},
		{id: 8, modelId: 4, year: 2014, name: "2014 Leaf", thumb: "http://images.thecarconnection.com/med/2013-nissan-leaf_100414473_m.jpg"}
	]);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{id}', store.updateData);
	fixture('DELETE /cars/{id}', store.destroyData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};

	stop();

	// $.ajax({ url: "/presetStore", method: "get", data: {year: 2013, modelId:1}, dataType: "json" })

	findAll().then(function(carsData) {
		equal(carsData.data.length, 8, 'Got all cars');
		return $.ajax({ url: "/cars/"+carsData.data[1].id, method: "DELETE", dataType: "json" });
	}).then(function() {
		return findAll();
	}).then(function(carsData) {
		equal(carsData.data.length, 7, 'One car less');
		equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
	}).then(function() {

		return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: "2015 Altima"
		} });
	}).then(function(saved) {

		return $.ajax({ url: "/cars/"+saved.id, method: "put", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: '2015 Nissan Altima'
		} });
	}).then(function(updated) {
		return findAll();
	}).then(function (cars) {
		equal(cars.data.length, 8, 'New car created');
		start();
	});
});


test("filtering works", function() {
	var next;
	var store = fixture.store(
		[	{ state : 'CA', name : 'Casadina' },
			{ state : 'NT', name : 'Alberny' }], new QueryLogic({
				identity: ["state"]
			}));

	fixture({
		'GET /api/cities' : store.getListData,
	});
	stop();
	$.getJSON('/api/cities?filter[state]=CA').then(function(data){
		deepEqual(data, {
			data: [{
				state : 'CA',
				name : 'Casadina'
			}],
			count: 1
		});
		QUnit.start();
	}, function(e){
		ok(false, ""+e);
		start();
	});
});

test("filtering works with nested props", function() {
	QUnit.stop();
	var store = fixture.store([{
		id : 1,
		name : 'Cheese City',
		slug : 'cheese-city',
		address : {
			city : 'Casadina',
			state : 'CA'
		}
	}, {
		id : 2,
		name : 'Crab Barn',
		slug : 'crab-barn',
		address : {
			city : 'Alberny',
			state : 'NT'
		}
	}]);

	fixture({
		'GET /restaurants' : store.getListData
	});
	$.getJSON('/api/restaurants?filter[address][city]=Alberny').then(function(responseData){

		deepEqual(responseData, {
			count: 1,
			data: [{
				id : 2,
				name : 'Crab Barn',
				slug : 'crab-barn',
				address : {
					city : 'Alberny',
					state : 'NT'
				}
			}]
		});
		QUnit.start();

	}, function(e){
		ok(false);
		start();
	});
});

test("filtering works with nested.props", function() {
	QUnit.stop();

	var store =fixture.store([{
		id : 1,
		name : 'Cheese City',
		slug : 'cheese-city',
		address : {
			city : 'Casadina',
			state : 'CA'
		}
	}, {
		id : 2,
		name : 'Crab Barn',
		slug : 'crab-barn',
		address : {
			city : 'Alberny',
			state : 'NT'
		}
	}]);
	store.connection.getListData({filter: {"address.city": "Alberny"}})
		.then(function(responseData){
			deepEqual(responseData, {
				count: 1,
				data: [{
					id : 2,
					name : 'Crab Barn',
					slug : 'crab-barn',
					address : {
						city : 'Alberny',
						state : 'NT'
					}
				}]
			});
			QUnit.start();
		});


});


QUnit.test("onreadystatechange, event is passed", function(){
	fixture("GET something", function(){
		return {};
	});

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "something");
	xhr.onreadystatechange = function(ev){
		ok(ev.target != null, "the event object passed to onreadystatechange");
		start();
	};
	xhr.send();
	stop();
});

if (__dirname !== '/') {
	asyncTest("doesn't break onreadystatechange (#3)", function () {
		var url = __dirname + '/fixtures/test.json';
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				ok(true, "we made a successful request");
				start();
			}
		};

		xhr.open('GET', url);
		xhr.send();
	});
}

QUnit.module("XHR Shim");

test("Supports onload", function(){
	var xhr = new XMLHttpRequest();
	QUnit.ok(("onload" in xhr), "shim passes onload detection");
});

if (__dirname !== '/') {
	asyncTest("supports addEventListener on XHR shim", function(){
		var url = __dirname + '/fixtures/test.json';
		var xhr = new XMLHttpRequest();

		xhr.addEventListener('load', function(){
			ok(true, "our shim supports addEventListener");
			start();
		});

		xhr.open('GET', url);
		xhr.send();
	});
}

if (__dirname !== '/') {
	asyncTest("supports removeEventListener on XHR shim", function(){
		var url = __dirname + '/fixtures/test.json';
		var xhr = new XMLHttpRequest();

		var onload = function(){
			ok(false, "this should not be called");
		};

		xhr.addEventListener('load', onload);
		xhr.removeEventListener("load", onload);

		xhr.onload = function(){
			setTimeout(function(){
				ok(true, 'didn\'t call the event listener');
				start();
			});
		};

		xhr.open('GET', url);
		xhr.send();
	});
}

test("supports setDisableHeaderCheck", function(){
	var xhr = new XMLHttpRequest();

	try {
		xhr.setDisableHeaderCheck(true);
		ok(true, "did not throw");
	} catch(e) {
		ok(false, "do not support setDisableHeaderCheck");
	}
});

if (__dirname !== '/') {
	asyncTest("supports setRequestHeader", function(){
		var url = __dirname + '/fixtures/test.json';
		var xhr = new XMLHttpRequest();

		xhr.setRequestHeader("foo", "bar");

		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4) {
				equal(xhr._requestHeaders.foo, "bar", "header was set");
				start();
			}
		};

		xhr.open("GET", url);
		xhr.send();
	});
}

if (__dirname !== '/') {
	asyncTest("supports getResponseHeader", function(){
		var url = __dirname + '/fixtures/test.json';
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4) {
				var header = xhr.getResponseHeader("Content-Type");
				ok(header.indexOf("application/json") >= 0, "got correct header back");
				start();
			}
		};

		xhr.open("GET", url);
		xhr.send();
	});
}

asyncTest("supports getAllResponseHeaders", function(){
	fixture("GET something", function(req,res){
		res(200, {
			message: 'this is the body'
		}, {
			foo: 'bar'
		});
	});

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4) {
			var headers = xhr.getAllResponseHeaders();
			var parsed = parseHeaders(headers);
			ok(typeof headers === "string", "got headers back");
			ok(parsed.foo === "bar", "got proper values");
			start();
		}
	};

	xhr.open("GET", "something");
	xhr.send();
});

asyncTest("pass data to response handler (#13)", function(){
	fixture("GET something", function(req,res){
		res(403, {
		    message: 'No bad guys'
		});
	});

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "something");
	xhr.onreadystatechange = function(ev){
		deepEqual(JSON.parse(this.responseText),{
		    message: 'No bad guys'
		}, "correct response");
		equal(this.status, 403, "correct status");
		start();
	};
	xhr.send();
});

asyncTest("pass return value for fixture", function(){

	fixture("GET something", {foo:"bar"});

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "something");
	xhr.onreadystatechange = function(ev){
		deepEqual(JSON.parse(this.responseText),{foo:"bar"}, "correct response");
		equal(this.status, 200, "correct status");
		start();
	};
	xhr.send();
});

if (__dirname !== '/') {
	asyncTest("pass headers in fallthrough", function() {
		var url = __dirname+'/fixtures/foobar.json';
		var xhr = new XMLHttpRequest();
		expect(2);

		xhr.open("GET", url);
		xhr.setRequestHeader("foo", "bar");
		xhr.onreadystatechange = function(ev){
			var originalXhr = ev.target;
			if(originalXhr.readyState === 1) {
				originalXhr.setRequestHeader = function(key, val) {
					equal(key, "foo");
					equal(val, "bar");
				};
			}
			if(originalXhr.readyState === 4) {
				start();
			}
		};
		xhr.send();
	});
}

test("first set.Algebra CRUD works (#12)", 5, function(){

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{_id}', store.updateData);
	fixture('DELETE /cars/{_id}', store.destroyData);
	fixture('GET /cars/{_id}', store.getData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};

	stop();

	// $.ajax({ url: "/presetStore", method: "get", data: {year: 2013, modelId:1}, dataType: "json" })

	findAll().then(function(carsData) {
		equal(carsData.data.length, 8, 'Got all cars');
		return $.ajax({ url: "/cars/"+carsData.data[1]._id, method: "DELETE", dataType: "json" });
	}).then(function() {
		return findAll();
	}).then(function(carsData) {
		equal(carsData.data.length, 7, 'One car less');
		equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
	}).then(function() {

		return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: "2015 Altima",
			type: "new"
		} });
	}).then(function(saved) {

		return $.ajax({ url: "/cars/"+saved._id, method: "put", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: '2015 Nissan Altima'
		} });
	}).then(function(updated) {
		return findAll();
	}).then(function (cars) {
		equal(cars.data.length, 8, 'New car created');
		return $.ajax({ url: "/cars/5", method: "get", dataType: "json" });

	}).then(function(car){
		equal(car.name, "2013 Altima", "get a single car works");
		start();
	});
});

test("set.Algebra CRUD works (#12)", 5, function(){

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{_id}', store.updateData);
	fixture('DELETE /cars/{_id}', store.destroyData);
	fixture('GET /cars/{_id}', store.getData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};

	stop();

	// $.ajax({ url: "/presetStore", method: "get", data: {year: 2013, modelId:1}, dataType: "json" })

	findAll().then(function(carsData) {
		equal(carsData.data.length, 8, 'Got all cars');
		return $.ajax({ url: "/cars/"+carsData.data[1]._id, method: "DELETE", dataType: "json" });
	}).then(function() {
		return findAll();
	}).then(function(carsData) {
		equal(carsData.data.length, 7, 'One car less');
		equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
	}).then(function() {

		return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: "2015 Altima",
			type: "new"
		} });
	}).then(function(saved) {

		return $.ajax({ url: "/cars/"+saved._id, method: "put", dataType: "json", data: {
			modelId: 3,
			year: 2015,
			name: '2015 Nissan Altima'
		} });
	}).then(function(updated) {
		return findAll();
	}).then(function (cars) {
		equal(cars.data.length, 8, 'New car created');
		return $.ajax({ url: "/cars/5", method: "get", dataType: "json" });

	}).then(function(car){
		equal(car.name, "2013 Altima", "get a single car works");
		start();
	});
});

asyncTest("set.Algebra clauses work", function(){

	var NumberValue = matches.makeComparatorType(function(a,b){
		if(a === b) {
			return true;
		}
		if(a && b) {
			return +a === +b;
		}
		return false;
	});

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end"),
		{
			schema: function(schema){
				schema.keys.year = NumberValue;
			}
		}
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);

	fixture('GET /cars', store.getListData);

	$.ajax({ url: "/cars?where[year]=2013", dataType: "json" }).then(function(carsData) {
		equal(carsData.data.length, 4, 'Where clause works with numbers');

		return $.ajax({ url: "/cars?where[year]=2013&orderBy=name", dataType: "json" });

	}).then(function(carsData){
		var names = carsData.data.map(function(c){ return c.name; });
		deepEqual(names, ["2013 Altima","2013 Focus","2013 Leaf","2013 Mustang"],"sort works");

		return $.ajax({ url: "/cars?where[year]=2013&orderBy=name&start=1&end=2", dataType: "json" });
	}).then(function(carsData){
		var names = carsData.data.map(function(c){ return c.name; });
		deepEqual(names, ["2013 Focus","2013 Leaf"], "pagination works");
		start();
	});

});

test("storeConnection reset", function(){

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"}
	], algebra);


	fixture('GET /cars', store.getListData);
	fixture('POST /cars', store.createData);
	fixture('PUT /cars/{_id}', store.updateData);
	fixture('DELETE /cars/{_id}', store.destroyData);
	fixture('GET /cars/{_id}', store.getData);

	var findAll = function(){
		return $.ajax({ url: "/cars", dataType: "json" });
	};
	$.ajax({ url: "/cars/1", method: "DELETE", dataType: "json" }).then(function(){
		store.reset();
		return findAll();
	}).then(function(carsData){
		equal(carsData.data.length, 2, 'Got all cars');
		start();
	});

	stop();

});

function makeAlgebraTest(fixtureUrl){
	return function() {

		var algebra = new set.Algebra(
			new set.Translate("where","where"),
			set.props.id("_id"),
			set.props.sort('orderBy'),
			set.props.enum("type", ["used","new","certified"]),
			set.props.rangeInclusive("start","end")
		);

		var store = fixture.store([
			{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
			{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
			{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
			{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
			{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
			{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
			{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
			{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
		], algebra);

		fixture(fixtureUrl, store);

		var findAll = function(){
			return $.ajax({ url: "/cars", dataType: "json" });
		};

		stop();

		findAll().then(function(carsData) {
			equal(carsData.data.length, 8, 'Got all cars');
			return $.ajax({ url: "/cars/"+carsData.data[1]._id, method: "DELETE", dataType: "json" });
		}).then(function() {
			return findAll();
		}).then(function(carsData) {
			equal(carsData.data.length, 7, 'One car less');
			equal(carsData.data[1].name, '2013 Focus', 'Car actually deleted');
		}).then(function() {

			return $.ajax({ url: "/cars", method: "post", dataType: "json", data: {
				modelId: 3,
				year: 2015,
				name: "2015 Altima",
				type: "new"
			} });
		}).then(function(saved) {

			return $.ajax({ url: "/cars/"+saved._id, method: "put", dataType: "json", data: {
				modelId: 3,
				year: 2015,
				name: '2015 Nissan Altima'
			} });
		}).then(function(updated) {
			return findAll();
		}).then(function (cars) {
			equal(cars.data.length, 8, 'New car created');
			return $.ajax({ url: "/cars/5", method: "get", dataType: "json" });

		}).then(function(car){
			equal(car.name, "2013 Altima", "get a single car works");
			start();
		});
	}
}

test("set.Algebra CRUD works with easy hookup (#12)", 5, makeAlgebraTest('/cars/{_id}'));
test("set.Algebra CRUD works with easy hookup and list-style url (#52)", 5, makeAlgebraTest('/cars'));


test("store.getList and store.get", function(){

	var algebra = new set.Algebra(
		set.props.id("_id")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);

	equal( store.getList({year: 2013}).data.length, 4, "filtered");

	deepEqual(store.get({_id: 5}).name, "2013 Altima", "get");

});

asyncTest("supports addEventListener on shim using fixture", function(){
	fixture("/addEventListener", function(){
		return {};
	});
	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		ok(true, "our shim supports addEventListener");
		start();
	});

	xhr.open('GET', "/addEventListener");
	xhr.send();
});

if (__dirname !== '/') {
	test("supports sync on XHR shim (#23)", function(){
		var url = __dirname + '/fixtures/test.json';
		var xhr = new XMLHttpRequest();

		xhr.addEventListener('load', function(){
			ok(true, "our shim supports addEventListener");
		});

		xhr.open('GET', url, false);
		xhr.send();
	});
}

test("supports sync fixtures (#23)", function(){
	fixture("/sync", function(){
		return {};
	});
	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		ok(true, "our shim supports sync");
	});

	xhr.open('GET', "/sync", false);
	xhr.send();
});

if (__dirname !== '/') {
	test("supports sync redirect fixtures (#23)", function(){
		fixture("/sync_redirect", __dirname+'/fixtures/test.json');

		var xhr = new XMLHttpRequest();

		xhr.addEventListener('load', function(){
			ok(true, "our shim supports sync redirect");
		});

		xhr.open('GET', "/sync_redirect", false);
		xhr.send();
	});
}

if (__dirname !== '/') {
	asyncTest("slow mode works (#26)", function(){
		var url = __dirname + '/fixtures/test.json';
		fixture({url: url}, 1000);

		var xhr = new XMLHttpRequest();

		var startTime = new Date();

		xhr.addEventListener('load', function(){
			var delay = new Date() - startTime;
			ok(delay >= 900, delay + "ms >= 900ms");
			fixture({url: url}, null);
			start();
		});

		xhr.open('GET', url);
		xhr.send();
	});
}

asyncTest('onload should be triggered for HTTP error responses (#36)', function() {
	fixture('/onload', function(req, res) {
		res(400);
	});

	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function() {
		ok(true, 'onload should be invoked');
		fixture('/onload', null);
		start();
	});

	xhr.addEventListener('error', function() {
		ok(false, 'onerror should not be invoked');
		fixture('/onload', null);
		start();
	});

	xhr.open('GET', '/onload');
	xhr.send();
});

asyncTest('responseText & responseXML should not be set for arraybuffer types (#38)', function() {

	fixture('/onload', '/test/fixtures/foo.json');

	var oldError = window.onerror;

	window.onerror = function (msg, url, line) {
	    ok(false, 'There should not be an error');
	    start();
	};

	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function() {
		fixture('/onload', null);
		window.onerror = oldError;
		ok(true, 'Got here without an error');
		start();
	});

	xhr.responseType = 'arraybuffer';
	xhr.open('GET', '/onload');
	xhr.send();
});

asyncTest('fixture with timeout does not run if $.ajax timeout less than delay', function() {
	var delay = fixture.delay;
	fixture.delay = 1000;
	fixture('/onload', function() {
		fixture('/onload', null);
		ok(false, 'timed out xhr did not abort');
		start();
	});

	$.ajax({
		url: '/onload',
		timeout: 50,
		error: function(xhr) {
			fixture('/onload', null);
			ok(true, 'Got to the error handler');
			equal(xhr.statusText, "timeout");
			equal(xhr.status, "0");
			start();
		}
	});

	fixture.delay = delay;
});

asyncTest("response headers are set", function(){
	fixture("GET /todos", function(request, response){
		response(200, "{}", { foo: "bar"});
	});

	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		var headers = parseHeaders(xhr.getAllResponseHeaders());

		ok(headers.foo === "bar", "header was set");
		start();
	});

	xhr.open('GET', "/todos");
	xhr.send();
});

asyncTest("match values in get data", function(){
	fixture({
		method: "GET",
		url: "/data-value",
		data: {name: "justin"}
	}, function(request, response){
		QUnit.ok(true, "got it");
		return {};
	});

	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		QUnit.start();
	});

	xhr.open('GET', "/data-value?name=justin&age=22");
	xhr.send();
});

asyncTest("universal match (#2000)", function(){
	fixture({},function(){
		ok(true, "got hit");
		return {};
	});
	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		QUnit.start();
		fixture.fixtures.splice(0, fixture.fixtures.length);
	});

	xhr.open('GET', "/something-totally-unexpected-62");
	xhr.send();
});


test("set.Algebra stores provide a count (#58)", function(){

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.props.id("_id"),
		set.props.sort('orderBy'),
		set.props.enum("type", ["used","new","certified"]),
		set.props.rangeInclusive("start","end")
	);

	var store = fixture.store([
		{_id: 1, modelId: 1, year: 2013, name: "2013 Mustang", type: "used"},
		{_id: 2, modelId: 1, year: 2014, name: "2014 Mustang", type: "new"},
		{_id: 3, modelId: 2, year: 2013, name: "2013 Focus", type: "used"},
		{_id: 4, modelId: 2, year: 2014, name: "2014 Focus", type: "certified"},
		{_id: 5, modelId: 3, year: 2013, name: "2013 Altima", type: "used"},
		{_id: 6, modelId: 3, year: 2014, name: "2014 Altima", type: "certified"},
		{_id: 7, modelId: 4, year: 2013, name: "2013 Leaf", type: "used"},
		{_id: 8, modelId: 4, year: 2014, name: "2014 Leaf", type: "used"}
	], algebra);

	fixture('/cars/{_id}', store);

	stop();

	$.ajax({ url: "/cars", dataType: "json", data: {start: 2, end: 3} }).then(function(carsData) {
		equal(carsData.data.length, 2, 'Got 2 cars');
		equal(carsData.count, 8, "got the count");
		QUnit.start();
	}, function(){
		QUnit.ok(false, "borked");
		QUnit.start();
	});
});

asyncTest('should allow Arrays as data type (#133)', function() {
	fixture('/array-data', function(req, res) {
		ok(req.data instanceof Array, 'data returned should be instance of Array');
		return {};
	});

	var data = [];
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('load', function() {
		fixture('/array-data', null);
		ok(true, 'should not throw when sending Array');
		start();
	});
	xhr.open('GET', '/array-data');
	xhr.send(data);
});

asyncTest('should allow FormData as data type (#133)', function() {
	fixture('/upload', function(req, res) {
		ok(req.data instanceof FormData, 'data returned should be instance of formdata');
		res(400);
	});

	var data = new FormData();
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('load', function() {
		fixture('/upload', null);
		ok(true, 'should not throw when sending FormData');
		start();
	});
	xhr.open('POST', '/upload', true);
	xhr.send(data);
});

if ("onabort" in XMLHttpRequest._XHR.prototype) {
	asyncTest('fixture with timeout aborts if xhr timeout less than delay', function() {
		fixture('/onload', 1000);

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/onload');
		xhr.send();

		setTimeout(function() {
			xhr.abort();
		}, 50);


		xhr.addEventListener('abort', function() {
			fixture('/onload', null);
			ok(true, 'Got to the error handler');
			equal(xhr.statusText, '');
			equal(xhr.status, 0);
			start();
		});

		xhr.addEventListener('load', function() {
			fixture('/onload', null);
			ok(false, 'timed out xhr did not abort');
			start();
		});

	});

	asyncTest('dynamic fixture with timeout does not run if xhr timeout less than delay', function() {
		var delay = fixture.delay;
		fixture.delay = 1000;
		fixture('/onload', function() {
			fixture('/onload', null);
			ok(false, 'timed out xhr did not abort');
			start();
		});

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/onload');
		setTimeout(function() {
			xhr.abort();
		}, 50);
		xhr.send();

		xhr.addEventListener('abort', function() {
			fixture('/onload', null);
			ok(true, 'Got to the error handler');
			equal(xhr.statusText, '');
			equal(xhr.status, 0);
			start();
		});

		fixture.delay = delay;
	});

	test("abort() sets readyState correctly", function(){
		stop();

		fixture('/foo', function() {
			return {};
		});

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/foo');

		xhr.addEventListener('abort', function() {
			fixture('/foo', null);
			ok(true, 'Got to the error handler');
			equal(xhr.status, 0);
			equal(xhr.statusText, '');

			setTimeout(function(){
				equal(xhr.readyState, 0);
				start();
			}, 50);
		});

		xhr.send();
		xhr.abort();
	});

	test("abort() of already completed fixture", function(){
		stop();

		fixture('/foo', function() {
			return {};
		});

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/foo');

		xhr.addEventListener('load', function() {
			fixture('/foo', null);
			equal(xhr.readyState, 4);
			xhr.abort();
			start();
		});

		xhr.send();
	});

	asyncTest('should be able to call getResponseHeader onload', function() {
		fixture('/onload', function(req, res) {
			res(400);
		});

		var xhr = new XMLHttpRequest();

		xhr.addEventListener('load', function() {
			fixture('/onload', null);
			xhr.getResponseHeader('Set-Cookie');
			ok(true, 'should not throw when calling getResponseHeader');
			start();
		});

		xhr.open('GET', '/onload');
		xhr.send();
	});
} // END onabort check
