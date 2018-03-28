var BasicQuery = require("can-query/src/types/basic-query");
var set = require("can-query/src/set");
var canReflect = require("can-reflect");
var dataFromUrl = require("./data-from-url");
var Query = require("can-query");

function removeFixtureAndXHR(query) {
	if(query.fixture || query.xhr) {
		var clone = canReflect.serialize(query);
		delete clone.fixture;
		delete clone.xhr;
		return clone;
	} else {
		return query;
	}
}

function identityIntersection(v1, v2) {
    return v1.value === v2.value ? v1 : set.EMPTY;
}
function identityDifference(v1, v2){
    return v1.value === v2.value ? set.EMPTY : v1;
}
function identityUnion(v1, v2) {
    return v1.value === v2.value ? v1 : set.UNDEFINABLE;
}
var identityComparitor = {
    intersection: identityIntersection,
    difference: identityDifference,
    union: identityUnion
};



function makeComparatorType(compare) {
	var Type = function(){};
	var SetType = function(value) {
		this.value = value;
	};
	SetType.prototype.isMember = function(value, root, keys){
	    return compare(this.value, value, root, keys);
	};
	canReflect.assignSymbols(Type,{
		"can.SetType": SetType
	});

	set.defineComparison(SetType,SetType, identityComparitor);

	set.defineComparison(set.UNIVERSAL,SetType,{
		difference: function(){
			return set.UNDEFINABLE;
		}
	});
	return Type;
}

function quickEqual(queryA, queryB){
	var q1 = new BasicQuery.And(removeFixtureAndXHR(queryA)),
		q2 = new BasicQuery.And(removeFixtureAndXHR(queryB));
	return set.isEqual( q1, q2 );
}

function quickSubset(queryA, queryB){
	return set.isSubset( new BasicQuery.And(queryA), new BasicQuery.And(queryB) );
}

// Define types
var types = {};
canReflect.eachKey({
	IsEmptyOrNull: function(a, b){
		if( a == null && canReflect.size(b) === 0 ) {
			return true;
		} else if( b == null && canReflect.size(a) === 0 ) {
			return true;
		} else {
			return quickEqual(a, b);
		}
	},
	isEmptyOrSubset: function(a, b) {
		if( a == null && canReflect.size(b) === 0 ) {
			return true;
		} else if( b == null && canReflect.size(a) === 0 ) {
			return true;
		} else {
			return quickSubset(a, b);
		}
	},
	TemplateUrl: function(a, b) {
		return !!dataFromUrl(a, b);
	},
	StringIgnoreCase: function(a, b){
		return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
	},
	Ignore: function(){
		return true;
	}
}, function(compare, name){
	types[name] = makeComparatorType(compare);
});





var schema = {
	identity: ["id"],
	properties: {
		url: types.TemplateUrl,
		fixture: types.Ignore,
		xhr: types.Ignore,
		type: types.StringIgnoreCase,
		method: types.StringIgnoreCase,
		helpers: types.Ignore,
		headers: types.IsEmptyOrNull,
		data: types.IsEmptyOrSubset
	}
};

var query = new Query(schema);




module.exports = {
	fixture: quickEqual,
	request: function(requestData, fixtureData) {
		return query.has({filter: fixtureData}, requestData);
	},
	matches: function(settings, fixture, exact) {
		if (exact) {
			return this.fixture(settings, fixture);
		} else {
			return this.request(settings, fixture)
		}
	},
	makeComparatorType: makeComparatorType
};
