var Query = require("can-query");

var canReflect = require("can-reflect");

var memoryStore = require("can-memory-store");


// Returns a function that calls the method on a connection.
// Wires up fixture signature to a connection signature.
var connectToConnection = function(method){
	return function(req, res){
		// have to get data from
		this.connection[method](req.data).then(function(data){
			res(data);
		}, function(err){
			res(403, err);
		});
	};
};
// Returns a new makeItems function for a different baseItems;
var makeMakeItems = function(baseItems, idProp){
	return function () {
		// clone baseItems
		var items = [],
			maxId = 0;
		baseItems.forEach(function(item){
			items.push(canReflect.serialize(item) );
			maxId = Math.max(item[idProp] + 1, maxId + 1) || items.length;
		});

		return {
			maxId: maxId,
			items: items
		};
	};
};

// A store constructor function
var Store = function(connection, makeItems, idProp){
	this.connection = connection;
	this.makeItems = makeItems;
	this.idProp = idProp;
	this.reset();
	// we have to make sure the methods can be called without their context
	for(var method in Store.prototype) {
		this[method] = this[method].bind(this);
	}
};
canReflect.assignMap(Store.prototype,{
	getListData: connectToConnection("getListData"),
	getData: connectToConnection( "getData"),

	// used
	createData: function(req, res){
		var idProp = this.idProp;
		// add an id
		req.data[idProp] = ++this.maxId;

		this.connection.createData(req.data).then(function(data){
			var responseData = {};
			responseData[idProp] = req.data[idProp];
			res(responseData);
		}, function(err){
			res(403, err);
		});
	},
	updateData: connectToConnection("updateData"),
	destroyData: connectToConnection("destroyData"),
	reset: function(newItems){
		if(newItems) {
			this.makeItems = makeMakeItems(newItems, this.idProp);
		}
		var itemData =  this.makeItems();
		this.maxId = itemData.maxId;
		this.connection.addSet({}, {data:itemData.items});
	},
	get: function (params) {
		var id = this.connection.id(params);
		return this.connection.getInstance(id);
	},
	getList: function(set){
		return this.connection._getListData(set);
	}
});
// legacy methods
canReflect.eachKey({
	findAll: "getListData",
	findOne: "getData",
	create: "createData",
	update: "updateData",
	destroy: "destroyData"
}, function(method, prop){
	Store.prototype[prop] = function(){
		// TODO: warn here
		return this[method].apply(this, arguments);
	};
});



// ## fixture.store
// Make a store of objects to use when making requests against fixtures.
Store.make = function (count, make, algebra) {
	/*jshint eqeqeq:false */


	// Figure out makeItems which populates data
	var makeItems,
		idProp;
	if(typeof count === "number") {
		if(!algebra) {
			algebra = new Query({});
		}
		idProp = algebra.getIdentityKeys()[0] || "id";
		makeItems = function () {
			var items = [];
			var maxId = 0;
			for (var i = 0; i < (count); i++) {
				//call back provided make
				var item = make(i, items);

				if (!item[idProp]) {
					item[idProp] = i;
				}
				maxId = Math.max(item[idProp] , maxId) || items.length;
				items.push(item);
			}
			return {
				maxId: maxId,
				items: items
			};
		};
	} else if(Array.isArray(count)){
		algebra = make;
		if(!algebra) {
			algebra = new Query({});
		}
		idProp = algebra.getIdentityKeys()[0] || "id";
		makeItems = makeMakeItems(count, idProp);
	}

	var connection = memoryStore({
		algebra: algebra
	});

	return new Store(connection, makeItems, idProp);
};

module.exports = Store;
