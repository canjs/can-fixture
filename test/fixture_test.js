var Qunit = require('steal-qunit');
var fixture = require("can-fixture");
var core = require("../core");
var set = require("can-set");
var $ = require("jquery");
var each = require("can-util/js/each/each");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");
var clone = require('steal-clone');

var errorCallback = function(xhr, status, error){
	ok(false);
	start();
};

QUnit.module('can-fixture');
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
		});
});
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


test('fixture.store fixtures', function () {
	stop();
	var store = fixture.store('thing', 1000, function (i) {
		return {
			id: i,
			name: 'thing ' + i
		};
	}, function (item, settings) {
		if (settings.data.searchText) {
			var regex = new RegExp('^' + settings.data.searchText);
			return regex.test(item.name);
		}
	});
	fixture('things', store.findAll);

	$.ajax({
		url: 'things',
		dataType: 'json',
		data: {
			offset: 100,
			limit: 200,
			order: ['name ASC'],
			searchText: 'thing 2'
		},
		success: function (things) {
			equal(things.data[0].name, 'thing 29', 'first item is correct');
			equal(things.data.length, 11, 'there are 11 items');
			start();
		}
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
	for(var i = 0; i < 100; i++) {
		result = rand(choices);
		matched[result.length] = true;
		matched[result[0]] = true;
	}

	for(i = 1; i <= 3; i++) {
		ok(matched[i], "has "+i);
		delete matched[i];
	}

	each(choices, function(choice){
		ok(matched[choice], "has "+choice);
		delete matched[choice];
	});

	ok(isEmptyObject(matched), "nothing else unexpected");
});

test('core.dataFromUrl', function () {
	var data = core.dataFromUrl('/thingers/{id}', '/thingers/5');
	equal(data.id, 5, 'gets data');
	data = core.dataFromUrl('/thingers/5?hi.there', '/thingers/5?hi.there');
	deepEqual(data, {}, 'gets data');
});

test('core.dataFromUrl with double character value', function () {
	var data = core.dataFromUrl('/days/{id}/time_slots.json', '/days/17/time_slots.json');
	equal(data.id, 17, 'gets data');
});

test('core.defaultCompare', function () {
	var same = set.equal({
		url: '/thingers/5'
	}, {
		url: '/thingers/{id}'
	}, core.defaultCompare);
	ok(same, 'they are similar');
	same = set.equal({
		url: '/thingers/5'
	}, {
		url: '/thingers'
	}, core.defaultCompare);
	ok(!same, 'they are not the same');
});

test('core.matches', function () {
	var same = core.matches({
		url: '/thingers/5'
	}, {
		url: '/thingers/{id}'
	});
	ok(same, 'similar');
	same = core.matches({
		url: '/thingers/5',
		type: 'get'
	}, {
		url: '/thingers/{id}'
	});
	ok(same, 'similar with extra pops on settings');
	var exact = core.matches({
		url: '/thingers/5',
		type: 'get'
	}, {
		url: '/thingers/{id}'
	}, true);
	ok(!exact, 'not exact');
	exact = core.matches({
		url: '/thingers/5'
	}, {
		url: '/thingers/5'
	}, true);
	ok(exact, 'exact');
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
		debugger;
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

test('fixture.store returns 404 on findOne with bad id (#803)', function () {
	var store = fixture.store(2, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	fixture('GET /models/{id}', store.findOne);
	stop();

	$.ajax({url: "/models/3", dataType: "json"}).then(function(){},function (data) {
		equal(data.statusText, 'error', 'statusText');
		equal(data.responseText, 'Requested resource not found', 'responseText');
		start();
	});
});

test('fixture.store returns 404 on update with a bad id (#803)', function () {
	var store = fixture.store(5, function (i) {
		return {
			id: i,
			name: 'Object ' + i
		};
	});

	stop();

	fixture('POST /models/{id}', store.update);

	$.ajax({url: "/models/6", dataType: "json", data: {'jedan': 'dva'}, type: 'POST'})
		.then(function(){},function (data) {
			equal(data.statusText, 'error', 'Got an error');
			equal(data.responseText, 'Requested resource not found', 'Got correct status message');
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

	fixture('DELETE /models/{id}', store.destroy);

	$.ajax({url: "/models/6", dataType: "json", type: 'DELETE'})
		.then(function(){},function (data) {
			equal(data.statusText, 'error', 'Got an error');
			equal(data.responseText, 'Requested resource not found', 'Got correct status message');
			start();
		});
});

test('fixture.store can use id of different type (#742)', function () {
	var store = fixture.store(100, function (i) {
			return {
				id: i,
				parentId: i * 2,
				name: 'Object ' + i
			};
		});
	fixture('GET /models', store.findAll);
	stop();
	$.ajax({url: "/models", dataType: "json", data: { parentId: '4' } })
		.then(function (models) {
			equal(models.data.length, 1, 'Got one model');
			deepEqual(models.data[0], { id: 2, parentId: 4, name: 'Object 2' });
			start();
		});
});

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
	store.create({
		data: {}
	}, function (responseData, responseHeaders) {
		equal(responseData.id, 0, 'the first id is 0');
	});
});

test('store creates sequential ids', function () {
	var store = fixture.store(0, function () {
		return {};
	});
	store.create({
		data: {}
	}, function (responseData, responseHeaders) {
		equal(responseData.id, 0, 'the first id is 0');
	});
	store.create({
		data: {}
	}, function (responseData, responseHeaders) {
		equal(responseData.id, 1, 'the second id is 1');
	});
	store.destroy({
		data: {
			id: 0
		}
	});
	store.create({
		data: {}
	}, function (responseData, responseHeaders) {
		equal(responseData.id, 2, 'the third id is 2');
	});
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

	var store = fixture.store([
		{id: 1, modelId: 1, year: 2013, name: "2013 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2012/07/01-2013-ford-mustang-gt-review-585x388.jpg"},
		{id: 2, modelId: 1, year: 2014, name: "2014 Mustang", thumb: "http://mustangsdaily.com/blog/wp-content/uploads/2013/03/2014-roush-mustang.jpg"},
		{id: 2, modelId: 2, year: 2013, name: "2013 Focus", thumb: "http://images.newcars.com/images/car-pictures/original/2013-Ford-Focus-Sedan-S-4dr-Sedan-Exterior.png"},
		{id: 2, modelId: 2, year: 2014, name: "2014 Focus", thumb: "http://ipinvite.iperceptions.com/Invitations/survey705/images_V2/top4.jpg"},
		{id: 2, modelId: 3, year: 2013, name: "2013 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/04-2013-nissan-altima-1333416664.jpg"},
		{id: 2, modelId: 3, year: 2014, name: "2014 Altima", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 2, modelId: 4, year: 2013, name: "2013 Leaf", thumb: "http://www.blogcdn.com/www.autoblog.com/media/2012/04/01-2013-nissan-altima-ny.jpg"},
		{id: 2, modelId: 4, year: 2014, name: "2014 Leaf", thumb: "http://images.thecarconnection.com/med/2013-nissan-leaf_100414473_m.jpg"}
	],{
		year: function(a, b){
			return a == b;

		},
		modelId: function(a, b){
			return a == b;
		}
	});


	fixture('GET /presetStore', store.findAll);
	stop();
	$.ajax({ url: "/presetStore", method: "get", data: {year: 2013, modelId:1}, dataType: "json" }).then(function(response){

		equal(response.data[0].id, 1, "got the first item");
		equal(response.data.length, 1, "only got one item");
		start();
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


	fixture('GET /cars', store.findAll);
	fixture('POST /cars', store.create);
	fixture('PUT /cars/{id}', store.update);
	fixture('DELETE /cars/{id}', store.destroy);

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

	var store = fixture.store(
		[	{ state : 'CA', name : 'Casadina' },
			{ state : 'NT', name : 'Alberny' }],
		// David, make sure this is here!
		{});

	fixture({
		'GET /api/cities' : store.findAll,
	});
	stop();
	$.getJSON('/api/cities?state=CA').then(function(data){
		deepEqual(data, {
			data: [{
				state : 'CA',
				name : 'Casadina'
			}],
			count: 1
		});
		next();
	}, function(e){
		ok(false, ""+e);
		start()
	});

	function next(){

		var store =fixture.store([{
			_id : 1,
			name : 'Cheese City',
			slug : 'cheese-city',
			address : {
				city : 'Casadina',
				state : 'CA'
			}
		}, {
			_id : 2,
			name : 'Crab Barn',
			slug : 'crab-barn',
			address : {
				city : 'Alberny',
				state : 'NT'
			}
		}],{

		});

		fixture({
			'GET /restaurants' : store.findAll
		});
		$.getJSON('/api/restaurants?address[city]=Alberny').then(function(responseData){

			deepEqual(responseData, {
				count: 1,
				data: [{
					_id : 2,
					name : 'Crab Barn',
					slug : 'crab-barn',
					address : {
						city : 'Alberny',
						state : 'NT'
					}
				}]
			});
			last();

		}, function(e){
			ok(false);
			debugger;
			start();
		});
	}
	function last(){
		var store =fixture.store([{
			_id : 1,
			name : 'Cheese City',
			slug : 'cheese-city',
			address : {
				city : 'Casadina',
				state : 'CA'
			}
		}, {
			_id : 2,
			name : 'Crab Barn',
			slug : 'crab-barn',
			address : {
				city : 'Alberny',
				state : 'NT'
			}
		}],{
			"address.city": function(restaurantValue, paramValue, restaurant, params){
				return restaurant.address.city === paramValue;
			}
		});
		var responseData = store.findAll({data: {"address.city": "Alberny"}});

		deepEqual(responseData, {
			count: 1,
			data: [{
				_id : 2,
				name : 'Crab Barn',
				slug : 'crab-barn',
				address : {
					city : 'Alberny',
					state : 'NT'
				}
			}]
		});
		start();
	}
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

QUnit.module("XHR Shim");

test("Supports onload", function(){
	var xhr = new XMLHttpRequest();
	QUnit.ok(("onload" in xhr), "shim passes onload detection");
});

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

test("supports setDisableHeaderCheck", function(){
	var url = __dirname + '/fixtures/test.json';
	var xhr = new XMLHttpRequest();

	try {
		xhr.setDisableHeaderCheck(true);
		ok(true, "did not throw");
	} catch(e) {
		ok(false, "do not support setDisableHeaderCheck");
	}
});

asyncTest("supports setRequestHeader", function(){
	var url = __dirname + '/fixtures/test.json';
	var xhr = new XMLHttpRequest();

	xhr.setRequestHeader("foo", "bar");

	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4) {
			equal(xhr._headers.foo, "bar", "header was set");
			start();
		}
	};

	xhr.open("GET", url);
	xhr.send();
});

asyncTest("supports getResponseHeader", function(){
	var url = __dirname + '/fixtures/test.json';
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4) {
			var header = xhr.getResponseHeader("Content-Type");
			ok(typeof header === "string", "did get a header back");
			start();
		}
	};

	xhr.open("GET", url);
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


test("set.Algebra CRUD works (#12)", 5, function(){

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.comparators.id("_id"),
		set.comparators.sort('orderBy'),
		set.comparators.enum("type", ["used","new","certified"]),
		set.comparators.rangeInclusive("start","end")
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


	fixture('GET /cars', store.findAll);
	fixture('POST /cars', store.create);
	fixture('PUT /cars/{_id}', store.update);
	fixture('DELETE /cars/{_id}', store.destroy);
	fixture('GET /cars/{_id}', store.findOne);

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
		equal(car.name, "2013 Altima", "get a single car works")
		start();
	});
});

test("set.Algebra CRUD works (#12)", 5, function(){

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.comparators.id("_id"),
		set.comparators.sort('orderBy'),
		set.comparators.enum("type", ["used","new","certified"]),
		set.comparators.rangeInclusive("start","end")
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
		equal(car.name, "2013 Altima", "get a single car works")
		start();
	});
});

asyncTest("set.Algebra clauses work", function(){
	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.comparators.id("_id"),
		set.comparators.sort('orderBy'),
		set.comparators.enum("type", ["used","new","certified"]),
		set.comparators.rangeInclusive("start","end"),
		{
			year: function(a, b){
				if(a === b) {
					return true;
				}
				if(a && b) {
					return +a === +b;
				}
				return false;
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

	fixture('GET /cars', store.findAll);

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
		set.comparators.id("_id")
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

test("set.Algebra CRUD works with easy hookup (#12)", 5, function(){

	var algebra = new set.Algebra(
		new set.Translate("where","where"),
		set.comparators.id("_id"),
		set.comparators.sort('orderBy'),
		set.comparators.enum("type", ["used","new","certified"]),
		set.comparators.rangeInclusive("start","end")
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

	fixture('/cars/{_id}', store)

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
		equal(car.name, "2013 Altima", "get a single car works")
		start();
	});
});


test("store.getList and store.get", function(){

	var algebra = new set.Algebra(
		set.comparators.id("_id")
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

test("supports sync on XHR shim (#23)", function(){
	var url = __dirname + '/fixtures/test.json';
	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		ok(true, "our shim supports addEventListener");
	});

	xhr.open('GET', url, false);
	xhr.send();
});

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

test("supports sync redirect fixtures (#23)", function(){
	fixture("/sync_redirect", __dirname+'/fixtures/test.json');

	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', function(){
		ok(true, "our shim supports sync redirect");
	});

	xhr.open('GET', "/sync_redirect", false);
	xhr.send();
});

asyncTest("slow mode works (#26)", function(){


	var url = __dirname + '/fixtures/test.json';
	fixture({url: url}, 1000);

	var xhr = new XMLHttpRequest();

	var startTime = new Date();

	xhr.addEventListener('load', function(){
		ok(Math.abs(new Date() - startTime - 1000) < 300, "within 300 ms of 1 second delay");
		fixture({url: url}, null);
		start();
	});

	xhr.open('GET', url);
	xhr.send();
});

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
	})

	xhr.open('GET', '/onload');
	xhr.send();
});

asyncTest('responseText & responseXML should not be set for arraybuffer types (#38)', function() {
	Object.defineProperty(XMLHttpRequest.prototype, "responseText", {
		get: function() { ok(false, 'should not get responseText'); },
		set: function() { ok(false, 'should not set responseText'); }
	});
	Object.defineProperty(XMLHttpRequest.prototype, "responseXML", {
		get: function() { ok(false, 'should not get responseXML'); },
		set: function() { ok(false, 'should not set responseXML'); }
	});

	clone({})
		.import('xhr')
		.then(function () {
			fixture('/onload', '/test/fixtures/foo.json');

			var xhr = new XMLHttpRequest();

			xhr.addEventListener('load', function() {
				fixture('/onload', null);
				ok(true, 'should not get or set responseText or responseXML');
				start();
			});

			xhr.open('GET', '/onload');
			xhr.responseType = 'arraybuffer';
			xhr.send();
		});
});
