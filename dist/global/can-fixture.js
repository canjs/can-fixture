/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-util@3.0.0-pre.27#js/assign/assign*/
define('can-util@3.0.0-pre.27#js/assign/assign', function (require, exports, module) {
    module.exports = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-util@3.0.0-pre.27#js/is-array-like/is-array-like*/
define('can-util@3.0.0-pre.27#js/is-array-like/is-array-like', function (require, exports, module) {
    function isArrayLike(obj) {
        var type = typeof obj;
        if (type === 'string') {
            return true;
        }
        var length = obj && type !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof arr !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    }
    module.exports = isArrayLike;
});
/*can-util@3.0.0-pre.27#js/each/each*/
define('can-util@3.0.0-pre.27#js/each/each', function (require, exports, module) {
    var isArrayLike = require('../is-array-like/is-array-like');
    function each(elements, callback, context) {
        var i = 0, key, len, item;
        if (elements) {
            if (isArrayLike(elements)) {
                for (len = elements.length; i < len; i++) {
                    item = elements[i];
                    if (callback.call(context || item, item, i, elements) === false) {
                        break;
                    }
                }
            } else if (typeof elements === 'object') {
                for (key in elements) {
                    if (Object.prototype.hasOwnProperty.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                        break;
                    }
                }
            }
        }
        return elements;
    }
    module.exports = each;
});
/*can-util@3.0.0-pre.27#js/last/last*/
define('can-util@3.0.0-pre.27#js/last/last', function (require, exports, module) {
    module.exports = function (arr) {
        return arr && arr[arr.length - 1];
    };
});
/*can-set@0.6.0-pre.4#src/helpers*/
define('fixture-can-set/src/helpers', function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var last = require('can-util/js/last/last');
    var IgnoreType = function () {
    };
    var helpers;
    module.exports = helpers = {
        eachInUnique: function (a, acb, b, bcb, defaultReturn) {
            var bCopy = assign({}, b), res;
            for (var prop in a) {
                res = acb(a[prop], b[prop], a, b, prop);
                if (res !== undefined) {
                    return res;
                }
                delete bCopy[prop];
            }
            for (prop in bCopy) {
                res = bcb(undefined, b[prop], a, b, prop);
                if (res !== undefined) {
                    return res;
                }
            }
            return defaultReturn;
        },
        doubleLoop: function (arr, callbacks) {
            if (typeof callbacks === 'function') {
                callbacks = { iterate: callbacks };
            }
            var i = 0;
            while (i < arr.length) {
                if (callbacks.start) {
                    callbacks.start(arr[i]);
                }
                var j = i + 1;
                while (j < arr.length) {
                    if (callbacks.iterate(arr[j], j, arr[i], i) === false) {
                        arr.splice(j, 1);
                    } else {
                        j++;
                    }
                }
                if (callbacks.end) {
                    callbacks.end(arr[i]);
                }
                i++;
            }
        },
        identityMap: function (arr) {
            var map = {};
            each(arr, function (value) {
                map[value] = 1;
            });
            return map;
        },
        arrayUnionIntersectionDifference: function (arr1, arr2) {
            var map = {};
            var intersection = [];
            var union = [];
            var difference = arr1.slice(0);
            each(arr1, function (value) {
                map[value] = true;
                union.push(value);
            });
            each(arr2, function (value) {
                if (map[value]) {
                    intersection.push(value);
                    var index = helpers.indexOf.call(difference, value);
                    if (index !== -1) {
                        difference.splice(index, 1);
                    }
                } else {
                    union.push(value);
                }
            });
            return {
                intersection: intersection,
                union: union,
                difference: difference
            };
        },
        arraySame: function (arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            var map = helpers.identityMap(arr1);
            for (var i = 0; i < arr2.length; i++) {
                var val = map[arr2[i]];
                if (!val) {
                    return false;
                } else if (val > 1) {
                    return false;
                } else {
                    map[arr2[i]]++;
                }
            }
            return true;
        },
        indexOf: Array.prototype.indexOf || function (item) {
            for (var i = 0, thisLen = this.length; i < thisLen; i++) {
                if (this[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        map: Array.prototype.map || function (cb) {
            var out = [];
            for (var i = 0, len = this.length; i < len; i++) {
                out.push(cb(this[i], i, this));
            }
            return out;
        },
        filter: Array.prototype.filter || function (cb) {
            var out = [];
            for (var i = 0, len = this.length; i < len; i++) {
                if (cb(this[i], i, this)) {
                    out.push(this[i]);
                }
            }
            return out;
        },
        ignoreType: new IgnoreType(),
        firstProp: function (set) {
            for (var prop in set) {
                return prop;
            }
        },
        index: function (compare, items, props) {
            if (!items || !items.length) {
                return undefined;
            }
            if (compare(props, items[0]) === -1) {
                return 0;
            } else if (compare(props, last(items)) === 1) {
                return items.length;
            }
            var low = 0, high = items.length;
            while (low < high) {
                var mid = low + high >>> 1, item = items[mid], computed = compare(props, item);
                if (computed === -1) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            }
            return high;
        },
        defaultSort: function (sortPropValue, item1, item2) {
            var parts = sortPropValue.split(' ');
            var sortProp = parts[0];
            var item1Value = item1[sortProp];
            var item2Value = item2[sortProp];
            var temp;
            var desc = parts[1] || '';
            desc = desc.toLowerCase() === 'desc';
            if (desc) {
                temp = item1Value;
                item1Value = item2Value;
                item2Value = temp;
            }
            if (item1Value < item2Value) {
                return -1;
            }
            if (item1Value > item2Value) {
                return 1;
            }
            return 0;
        }
    };
});
/*can-set@0.6.0-pre.4#src/clause*/
define('fixture-can-set/src/clause', function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var clause = {};
    module.exports = clause;
    clause.TYPES = [
        'where',
        'order',
        'paginate',
        'id'
    ];
    each(clause.TYPES, function (type) {
        var className = type.charAt(0).toUpperCase() + type.substr(1);
        clause[className] = function (compare) {
            assign(this, compare);
        };
        clause[className].type = type;
    });
});
/*can-util@3.0.0-pre.27#js/make-array/make-array*/
define('can-util@3.0.0-pre.27#js/make-array/make-array', function (require, exports, module) {
    var each = require('../each/each');
    function makeArray(arr) {
        var ret = [];
        each(arr, function (a, i) {
            ret[i] = a;
        });
        return ret;
    }
    module.exports = makeArray;
});
/*can-set@0.6.0-pre.4#src/compare*/
define('fixture-can-set/src/compare', function (require, exports, module) {
    var h = require('fixture-can-set/src/helpers');
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var makeArray = require('can-util/js/make-array/make-array');
    var compareHelpers;
    var loop = function (a, b, aParent, bParent, prop, compares, options) {
        var checks = options.checks;
        for (var i = 0; i < checks.length; i++) {
            var res = checks[i](a, b, aParent, bParent, prop, compares || {}, options);
            if (res !== undefined) {
                return res;
            }
        }
        return options['default'];
    };
    var addIntersectedPropertyToResult = function (a, b, aParent, bParent, prop, compares, options) {
        var subsetCheck;
        if (!(prop in aParent)) {
            subsetCheck = 'subsetB';
        } else if (prop in bParent) {
            return false;
        }
        if (!(prop in bParent)) {
            subsetCheck = 'subsetA';
        }
        if (subsetCheck === 'subsetB') {
            options.result[prop] = b;
        } else {
            options.result[prop] = a;
        }
        return undefined;
    };
    var addToResult = function (fn, name) {
        return function (a, b, aParent, bParent, prop, compares, options) {
            var res = fn.apply(this, arguments);
            if (res === true) {
                if (prop !== undefined && !(prop in options.result)) {
                    options.result[prop] = a;
                }
                return true;
            } else {
                return res;
            }
        };
    };
    module.exports = compareHelpers = {
        equal: function (a, b, aParent, bParent, prop, compares, options) {
            options.checks = [
                compareHelpers.equalComparesType,
                compareHelpers.equalBasicTypes,
                compareHelpers.equalArrayLike,
                compareHelpers.equalObject
            ];
            options['default'] = false;
            return loop(a, b, aParent, bParent, prop, compares, options);
        },
        equalComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return compareResult;
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('intersection' in compareResult && !('difference' in compareResult)) {
                        var reverseResult = compares(b, a, bParent, aParent, prop, options);
                        return 'intersection' in reverseResult && !('difference' in reverseResult);
                    }
                    return false;
                }
                return compareResult;
            }
        },
        equalBasicTypes: function (a, b, aParent, bParent, prop, compares, options) {
            if (a === null || b === null) {
                return a === b;
            }
            if (a instanceof Date || b instanceof Date) {
                return a === b;
            }
            if (options.deep === -1) {
                return typeof a === 'object' || a === b;
            }
            if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
                return false;
            }
            if (a === b) {
                return true;
            }
        },
        equalArrayLike: function (a, b, aParent, bParent, prop, compares, options) {
            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    var compare = compares[i] === undefined ? compares['*'] : compares[i];
                    if (!loop(a[i], b[i], a, b, i, compare, options)) {
                        return false;
                    }
                }
                return true;
            }
        },
        equalObject: function (a, b, aParent, bParent, parentProp, compares, options) {
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                var bCopy = assign({}, b);
                if (options.deep === false) {
                    options.deep = -1;
                }
                for (var prop in a) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    if (!loop(a[prop], b[prop], a, b, prop, compare, options)) {
                        return false;
                    }
                    delete bCopy[prop];
                }
                for (prop in bCopy) {
                    if (compares[prop] === undefined || !loop(undefined, b[prop], a, b, prop, compares[prop], options)) {
                        return false;
                    }
                }
                return true;
            }
        },
        subset: function (a, b, aParent, bParent, prop, compares, options) {
            options.checks = [
                compareHelpers.subsetComparesType,
                compareHelpers.equalBasicTypes,
                compareHelpers.equalArrayLike,
                compareHelpers.subsetObject
            ];
            options.getSubsets = [];
            options['default'] = false;
            return loop(a, b, aParent, bParent, prop, compares, options);
        },
        subsetObject: function (a, b, aParent, bParent, parentProp, compares, options) {
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                return h.eachInUnique(a, function (a, b, aParent, bParent, prop) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    if (!loop(a, b, aParent, bParent, prop, compare, options) && prop in bParent) {
                        return false;
                    }
                }, b, function (a, b, aParent, bParent, prop) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    if (!loop(a, b, aParent, bParent, prop, compare, options)) {
                        return false;
                    }
                }, true);
            }
        },
        subsetComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return compareResult;
                } else if (compareResult && typeof compareResult === 'object') {
                    if (compareResult.getSubset) {
                        if (h.indexOf.call(options.getSubsets, compareResult.getSubset) === -1) {
                            options.getSubsets.push(compareResult.getSubset);
                        }
                    }
                    if (compareResult.intersection === h.ignoreType || compareResult.difference === h.ignoreType) {
                        return true;
                    }
                    if ('intersection' in compareResult && !('difference' in compareResult)) {
                        var reverseResult = compares(b, a, bParent, aParent, prop, options);
                        return 'intersection' in reverseResult;
                    }
                    return false;
                }
                return compareResult;
            }
        },
        properSupersetObject: function (a, b, aParent, bParent, parentProp, compares, options) {
            var bType = typeof b;
            var hasAdditionalProp = false;
            if (bType === 'object' || bType === 'function') {
                var aCopy = assign({}, a);
                if (options.deep === false) {
                    options.deep = -1;
                }
                for (var prop in b) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    var compareResult = loop(a[prop], b[prop], a, b, prop, compare, options);
                    if (compareResult === h.ignoreType) {
                    } else if (!(prop in a) || options.performedDifference) {
                        hasAdditionalProp = true;
                    } else if (!compareResult) {
                        return false;
                    }
                    delete aCopy[prop];
                }
                for (prop in aCopy) {
                    if (compares[prop] === undefined || !loop(a[prop], undefined, a, b, prop, compares[prop], options)) {
                        return false;
                    }
                }
                return hasAdditionalProp;
            }
        },
        properSubsetComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return compareResult;
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('intersection' in compareResult && !('difference' in compareResult)) {
                        var reverseResult = compares(b, a, bParent, aParent, prop, options);
                        return 'intersection' in reverseResult && 'difference' in reverseResult;
                    }
                    return false;
                }
                return compareResult;
            }
        },
        difference: function (a, b, aParent, bParent, prop, compares, options) {
            options.result = {};
            options.performedDifference = 0;
            options.checks = [
                compareHelpers.differenceComparesType,
                addToResult(compareHelpers.equalBasicTypes, 'equalBasicTypes'),
                addToResult(compareHelpers.equalArrayLike, 'equalArrayLike'),
                addToResult(compareHelpers.properSupersetObject, 'properSubsetObject')
            ];
            options['default'] = true;
            var res = loop(a, b, aParent, bParent, prop, compares, options);
            if (res === true && options.performedDifference) {
                return options.result;
            }
            return res;
        },
        differenceComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    if (compareResult === true) {
                        options.result[prop] = a;
                        return true;
                    } else {
                        return compareResult;
                    }
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('difference' in compareResult) {
                        if (compareResult.difference === h.ignoreType) {
                            return h.ignoreType;
                        } else if (compareResult.difference != null) {
                            options.result[prop] = compareResult.difference;
                            options.performedDifference++;
                            return true;
                        } else {
                            return true;
                        }
                    } else {
                        if (compareHelpers.equalComparesType.apply(this, arguments)) {
                            options.performedDifference++;
                            options.result[prop] = compareResult.union;
                        } else {
                            return false;
                        }
                    }
                }
            }
        },
        union: function (a, b, aParent, bParent, prop, compares, options) {
            options.result = {};
            options.performedUnion = 0;
            options.checks = [
                compareHelpers.unionComparesType,
                addToResult(compareHelpers.equalBasicTypes, 'equalBasicTypes'),
                addToResult(compareHelpers.unionArrayLike, 'unionArrayLike'),
                addToResult(compareHelpers.unionObject, 'unionObject')
            ];
            options.getUnions = [];
            options['default'] = false;
            var res = loop(a, b, aParent, bParent, prop, compares, options);
            if (res === true) {
                return options.result;
            }
            return false;
        },
        unionComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    if (compareResult === true) {
                        options.result[prop] = a;
                        return true;
                    } else {
                        return compareResult;
                    }
                } else if (compareResult && typeof compareResult === 'object') {
                    if (compareResult.getUnion) {
                        if (h.indexOf.call(options.getUnions, compareResult.getUnion) === -1) {
                            options.getUnions.push(compareResult.getUnion);
                        }
                    }
                    if ('union' in compareResult) {
                        if (compareResult.union === h.ignoreType) {
                            return compareResult.union;
                        }
                        if (compareResult.union !== undefined) {
                            options.result[prop] = compareResult.union;
                        }
                        options.performedUnion++;
                        return true;
                    }
                }
            }
        },
        unionObject: function (a, b, aParent, bParent, prop, compares, options) {
            var subsetCompare = function (a, b, aParent, bParent, prop) {
                var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                if (!loop(a, b, aParent, bParent, prop, compare, options)) {
                    var subsetCheck;
                    if (!(prop in aParent)) {
                        subsetCheck = 'subsetB';
                    }
                    if (!(prop in bParent)) {
                        subsetCheck = 'subsetA';
                    }
                    if (subsetCheck) {
                        if (!options.subset) {
                            options.subset = subsetCheck;
                        }
                        return options.subset === subsetCheck ? undefined : false;
                    }
                    return false;
                }
            };
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                return h.eachInUnique(a, subsetCompare, b, subsetCompare, true);
            }
        },
        unionArrayLike: function (a, b, aParent, bParent, prop, compares, options) {
            if (Array.isArray(a) && Array.isArray(b)) {
                var combined = makeArray(a).concat(makeArray(b));
                h.doubleLoop(combined, function (item, j, cur, i) {
                    var res = !compareHelpers.equal(cur, item, aParent, bParent, undefined, compares['*'], { 'default': false });
                    return res;
                });
                options.result[prop] = combined;
                return true;
            }
        },
        count: function (a, b, aParent, bParent, prop, compares, options) {
            options.checks = [
                compareHelpers.countComparesType,
                compareHelpers.equalBasicTypes,
                compareHelpers.equalArrayLike,
                compareHelpers.loopObject
            ];
            options['default'] = false;
            loop(a, b, aParent, bParent, prop, compares, options);
            if (typeof options.count === 'number') {
                return options.count;
            }
            return Infinity;
        },
        countComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return true;
                } else if (compareResult && typeof compareResult === 'object') {
                    if (typeof compareResult.count === 'number') {
                        if (!('count' in options) || compareResult.count === options.count) {
                            options.count = compareResult.count;
                        } else {
                            options.count = Infinity;
                        }
                    }
                    return true;
                }
            }
        },
        loopObject: function (a, b, aParent, bParent, prop, compares, options) {
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                each(a, function (aValue, prop) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    loop(aValue, b[prop], a, b, prop, compare, options);
                });
                return true;
            }
        },
        intersection: function (a, b, aParent, bParent, prop, compares, options) {
            options.result = {};
            options.performedIntersection = 0;
            options.checks = [
                compareHelpers.intersectionComparesType,
                addToResult(compareHelpers.equalBasicTypes, 'equalBasicTypes'),
                addToResult(compareHelpers.intersectionArrayLike, 'intersectionArrayLike'),
                compareHelpers.intersectionObject
            ];
            options['default'] = false;
            var res = loop(a, b, aParent, bParent, prop, compares, options);
            if (res === true) {
                return options.result;
            }
            return false;
        },
        intersectionComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    if (compareResult === true) {
                        options.result[prop] = a;
                        return true;
                    } else {
                        return compareResult;
                    }
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('intersection' in compareResult) {
                        if (compareResult.intersection !== undefined) {
                            options.result[prop] = compareResult.intersection;
                        }
                        options.performedIntersection++;
                        return true;
                    }
                }
            }
        },
        intersectionObject: function (a, b, aParent, bParent, prop, compares, options) {
            var subsetCompare = function (a, b, aParent, bParent, prop) {
                var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                if (!loop(a, b, aParent, bParent, prop, compare, options)) {
                    return addIntersectedPropertyToResult(a, b, aParent, bParent, prop, compares, options);
                }
            };
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                return h.eachInUnique(a, subsetCompare, b, subsetCompare, true);
            }
        },
        intersectionArrayLike: function (a, b, aParent, bParent, prop, compares, options) {
            if (Array.isArray(a) && Array.isArray(b)) {
                var intersection = [];
                each(makeArray(a), function (cur) {
                    for (var i = 0; i < b.length; i++) {
                        if (compareHelpers.equal(cur, b[i], aParent, bParent, undefined, compares['*'], { 'default': false })) {
                            intersection.push(cur);
                            break;
                        }
                    }
                });
                options.result[prop] = intersection;
                return true;
            }
        }
    };
});
/*can-set@0.6.0-pre.4#src/get*/
define('fixture-can-set/src/get', function (require, exports, module) {
    var compare = require('fixture-can-set/src/compare');
    var h = require('fixture-can-set/src/helpers');
    var each = require('can-util/js/each/each');
    var filterData = function (data, clause, comparators) {
        return h.filter.call(data, function (item) {
            var isSubset = compare.subset(item, clause, undefined, undefined, undefined, comparators, {});
            return isSubset;
        });
    };
    module.exports = {
        subsetData: function (a, b, bData, algebra) {
            var aClauseProps = algebra.getClauseProperties(a);
            var bClauseProps = algebra.getClauseProperties(b);
            var options = {};
            var aData = filterData(bData, aClauseProps.where, algebra.clauses.where);
            if (aData.length && (aClauseProps.enabled.order || bClauseProps.enabled.order)) {
                options = {};
                var propName = h.firstProp(aClauseProps.order), compareOrder = algebra.clauses.order[propName];
                aData = aData.sort(function (aItem, bItem) {
                    return compareOrder(a[propName], aItem, bItem);
                });
            }
            if (aData.length && (aClauseProps.enabled.paginate || bClauseProps.enabled.paginate)) {
                options = {};
                compare.subset(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, algebra.clauses.paginate, options);
                each(options.getSubsets, function (filter) {
                    aData = filter(a, b, aData, algebra, options);
                });
            }
            return aData;
        }
    };
});
/*can-util@3.0.0-pre.27#js/is-empty-object/is-empty-object*/
define('can-util@3.0.0-pre.27#js/is-empty-object/is-empty-object', function (require, exports, module) {
    module.exports = function (obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    };
});
/*can-set@0.6.0-pre.4#src/set-core*/
define('fixture-can-set/src/set-core', function (require, exports, module) {
    var h = require('fixture-can-set/src/helpers');
    var clause = require('fixture-can-set/src/clause');
    var compare = require('fixture-can-set/src/compare');
    var get = require('fixture-can-set/src/get');
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var makeArray = require('can-util/js/make-array/make-array');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    function Translate(clause, options) {
        if (typeof options === 'string') {
            var path = options;
            options = {
                fromSet: function (set, setRemainder) {
                    return set[path] || {};
                },
                toSet: function (set, wheres) {
                    set[path] = wheres;
                    return set;
                }
            };
        }
        this.clause = clause;
        assign(this, options);
    }
    var Algebra = function () {
        var clauses = this.clauses = {
            where: {},
            order: {},
            paginate: {},
            id: {}
        };
        this.translators = {
            where: new Translate('where', {
                fromSet: function (set, setRemainder) {
                    return setRemainder;
                },
                toSet: function (set, wheres) {
                    return assign(set, wheres);
                }
            })
        };
        var self = this;
        each(arguments, function (arg) {
            if (arg) {
                if (arg instanceof Translate) {
                    self.translators[arg.clause] = arg;
                } else {
                    assign(clauses[arg.constructor.type || 'where'], arg);
                }
            }
        });
    };
    Algebra.make = function (compare, count) {
        if (compare instanceof Algebra) {
            return compare;
        } else {
            return new Algebra(compare, count);
        }
    };
    assign(Algebra.prototype, {
        getClauseProperties: function (set, options) {
            options = options || {};
            var setClone = assign({}, set);
            var clauses = this.clauses;
            var checkClauses = [
                'order',
                'paginate',
                'id'
            ];
            var clauseProps = {
                enabled: {
                    where: true,
                    order: false,
                    paginate: false,
                    id: false
                }
            };
            if (options.omitClauses) {
                checkClauses = h.arrayUnionIntersectionDifference(checkClauses, options.omitClauses).difference;
            }
            each(checkClauses, function (clauseName) {
                var valuesForClause = {};
                var prop;
                for (prop in clauses[clauseName]) {
                    if (prop in setClone) {
                        valuesForClause[prop] = setClone[prop];
                        delete setClone[prop];
                    }
                }
                clauseProps[clauseName] = valuesForClause;
                clauseProps.enabled[clauseName] = !isEmptyObject(valuesForClause);
            });
            clauseProps.where = options.isProperties ? setClone : this.translators.where.fromSet(set, setClone);
            return clauseProps;
        },
        getDifferentClauseTypes: function (aClauses, bClauses) {
            var self = this;
            var differentTypes = [];
            each(clause.TYPES, function (type) {
                if (!self.evaluateOperator(compare.equal, aClauses[type], bClauses[type], { isProperties: true }, { isProperties: true })) {
                    differentTypes.push(type);
                }
            });
            return differentTypes;
        },
        updateSet: function (set, clause, result, useSet) {
            if (result && typeof result === 'object' && useSet !== false) {
                if (this.translators[clause]) {
                    set = this.translators.where.toSet(set, result);
                } else {
                    set = assign(set, result);
                }
                return true;
            } else if (result) {
                return useSet === undefined ? undefined : false;
            } else {
                return false;
            }
        },
        evaluateOperator: function (operator, a, b, aOptions, bOptions, evaluateOptions) {
            aOptions = aOptions || {};
            bOptions = bOptions || {};
            evaluateOptions = assign({
                evaluateWhere: operator,
                evaluatePaginate: operator,
                evaluateOrder: operator,
                shouldEvaluatePaginate: function (aClauseProps, bClauseProps) {
                    return aClauseProps.enabled.paginate || bClauseProps.enabled.paginate;
                },
                shouldEvaluateOrder: function (aClauseProps, bClauseProps) {
                    return aClauseProps.enabled.order && compare.equal(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
                }
            }, evaluateOptions || {});
            var aClauseProps = this.getClauseProperties(a, aOptions), bClauseProps = this.getClauseProperties(b, bOptions), set = {}, useSet;
            var result = evaluateOptions.evaluateWhere(aClauseProps.where, bClauseProps.where, undefined, undefined, undefined, this.clauses.where, {});
            useSet = this.updateSet(set, 'where', result, useSet);
            if (result && evaluateOptions.shouldEvaluatePaginate(aClauseProps, bClauseProps)) {
                if (evaluateOptions.shouldEvaluateOrder(aClauseProps, bClauseProps)) {
                    result = evaluateOptions.evaluateOrder(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
                    useSet = this.updateSet(set, 'order', result, useSet);
                }
                if (result) {
                    result = evaluateOptions.evaluatePaginate(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, this.clauses.paginate, {});
                    useSet = this.updateSet(set, 'paginate', result, useSet);
                }
            } else if (result && evaluateOptions.shouldEvaluateOrder(aClauseProps, bClauseProps)) {
                result = operator(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
                useSet = this.updateSet(set, 'order', result, useSet);
            }
            return result && useSet ? set : result;
        },
        equal: function (a, b) {
            return this.evaluateOperator(compare.equal, a, b);
        },
        subset: function (a, b) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var compatibleSort = true;
            var result;
            if (bClauseProps.enabled.paginate && (aClauseProps.enabled.order || bClauseProps.enabled.order)) {
                compatibleSort = compare.equal(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
            }
            if (!compatibleSort) {
                result = false;
            } else {
                result = this.evaluateOperator(compare.subset, a, b);
            }
            return result;
        },
        properSubset: function (a, b) {
            return this.subset(a, b) && !this.equal(a, b);
        },
        difference: function (a, b) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var differentClauses = this.getDifferentClauseTypes(aClauseProps, bClauseProps);
            var result;
            switch (differentClauses.length) {
            case 0: {
                    result = false;
                    break;
                }
            case 1: {
                    var clause = differentClauses[0];
                    result = compare.difference(aClauseProps[clause], bClauseProps[clause], undefined, undefined, undefined, this.clauses[clause], {});
                    if (this.translators[clause] && typeof result === 'object') {
                        result = this.translators[clause].toSet({}, result);
                    }
                    break;
                }
            }
            return result;
        },
        union: function (a, b) {
            return this.evaluateOperator(compare.union, a, b);
        },
        intersection: function (a, b) {
            return this.evaluateOperator(compare.intersection, a, b);
        },
        count: function (a) {
            return this.evaluateOperator(compare.count, a, {});
        },
        has: function (set, props) {
            var aClauseProps = this.getClauseProperties(set);
            var propsClauseProps = this.getClauseProperties(props, { isProperties: true });
            var compatibleSort = true;
            var result;
            if ((propsClauseProps.enabled.paginate || aClauseProps.enabled.paginate) && (propsClauseProps.enabled.order || aClauseProps.enabled.order)) {
                compatibleSort = compare.equal(propsClauseProps.order, aClauseProps.order, undefined, undefined, undefined, {}, {});
            }
            if (!compatibleSort) {
                result = false;
            } else {
                result = this.evaluateOperator(compare.subset, props, set, { isProperties: true }, undefined);
            }
            return result;
        },
        index: function (set, items, item) {
            var aClauseProps = this.getClauseProperties(set);
            var propName = h.firstProp(aClauseProps.order), compare, orderValue;
            if (propName) {
                compare = this.clauses.order[propName];
                orderValue = set[propName];
                return h.index(function (itemA, itemB) {
                    return compare(orderValue, itemA, itemB);
                }, items, item);
            }
            propName = h.firstProp(this.clauses.id);
            if (propName) {
                compare = h.defaultSort;
                orderValue = propName;
                return h.index(function (itemA, itemB) {
                    return compare(orderValue, itemA, itemB);
                }, items, item);
            }
            return;
        },
        getSubset: function (a, b, bData) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var isSubset = this.subset(assign({}, aClauseProps.where, aClauseProps.paginate), assign({}, bClauseProps.where, bClauseProps.paginate));
            if (isSubset) {
                return get.subsetData(a, b, bData, this);
            }
        },
        getUnion: function (a, b, aItems, bItems) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var algebra = this;
            var options;
            if (this.subset(a, b)) {
                return bItems;
            } else if (this.subset(b, a)) {
                return aItems;
            }
            var combined;
            if (aClauseProps.enabled.paginate || bClauseProps.enabled.paginate) {
                options = {};
                var isUnion = compare.union(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, this.clauses.paginate, options);
                if (!isUnion) {
                    return;
                } else {
                    each(options.getUnions, function (filter) {
                        var items = filter(a, b, aItems, bItems, algebra, options);
                        aItems = items[0];
                        bItems = items[1];
                    });
                    combined = aItems.concat(bItems);
                }
            } else {
                combined = aItems.concat(bItems);
            }
            if (combined.length && aClauseProps.enabled.order && compare.equal(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {})) {
                options = {};
                var propName = h.firstProp(aClauseProps.order), compareOrder = algebra.clauses.order[propName];
                combined = combined.sort(function (aItem, bItem) {
                    return compareOrder(a[propName], aItem, bItem);
                });
            }
            return combined;
        }
    });
    var callOnAlgebra = function (methodName, algebraArgNumber) {
        return function () {
            var args = makeArray(arguments).slice(0, algebraArgNumber);
            var algebra = Algebra.make(arguments[algebraArgNumber]);
            return algebra[methodName].apply(algebra, args);
        };
    };
    module.exports = {
        Algebra: Algebra,
        Translate: Translate,
        difference: callOnAlgebra('difference', 2),
        equal: callOnAlgebra('equal', 2),
        subset: callOnAlgebra('subset', 2),
        properSubset: callOnAlgebra('properSubset', 2),
        union: callOnAlgebra('union', 2),
        intersection: callOnAlgebra('intersection', 2),
        count: callOnAlgebra('count', 1),
        has: callOnAlgebra('has', 2),
        index: callOnAlgebra('index', 3),
        getSubset: callOnAlgebra('getSubset', 3),
        getUnion: callOnAlgebra('getUnion', 4)
    };
});
/*can-set@0.6.0-pre.4#src/comparators*/
define('fixture-can-set/src/comparators', function (require, exports, module) {
    var h = require('fixture-can-set/src/helpers');
    var clause = require('fixture-can-set/src/clause');
    var each = require('can-util/js/each/each');
    var within = function (value, range) {
        return value >= range[0] && value <= range[1];
    };
    var numericProperties = function (setA, setB, property1, property2) {
        return {
            sAv1: +setA[property1],
            sAv2: +setA[property2],
            sBv1: +setB[property1],
            sBv2: +setB[property2]
        };
    };
    var diff = function (setA, setB, property1, property2) {
        var numProps = numericProperties(setA, setB, property1, property2);
        var sAv1 = numProps.sAv1, sAv2 = numProps.sAv2, sBv1 = numProps.sBv1, sBv2 = numProps.sBv2, count = sAv2 - sAv1 + 1;
        var after = {
            difference: [
                sBv2 + 1,
                sAv2
            ],
            intersection: [
                sAv1,
                sBv2
            ],
            union: [
                sBv1,
                sAv2
            ],
            count: count,
            meta: 'after'
        };
        var before = {
            difference: [
                sAv1,
                sBv1 - 1
            ],
            intersection: [
                sBv1,
                sAv2
            ],
            union: [
                sAv1,
                sBv2
            ],
            count: count,
            meta: 'before'
        };
        if (sAv1 === sBv1 && sAv2 === sBv2) {
            return {
                intersection: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sAv1,
                    sAv2
                ],
                count: count,
                meta: 'equal'
            };
        } else if (sAv1 === sBv1 && sBv2 < sAv2) {
            return after;
        } else if (sAv2 === sBv2 && sBv1 > sAv1) {
            return before;
        } else if (within(sAv1, [
                sBv1,
                sBv2
            ]) && within(sAv2, [
                sBv1,
                sBv2
            ])) {
            return {
                intersection: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sBv1,
                    sBv2
                ],
                count: count,
                meta: 'subset'
            };
        } else if (within(sBv1, [
                sAv1,
                sAv2
            ]) && within(sBv2, [
                sAv1,
                sAv2
            ])) {
            return {
                intersection: [
                    sBv1,
                    sBv2
                ],
                difference: [
                    null,
                    null
                ],
                union: [
                    sAv1,
                    sAv2
                ],
                count: count,
                meta: 'superset'
            };
        } else if (sAv1 < sBv1 && within(sAv2, [
                sBv1,
                sBv2
            ])) {
            return before;
        } else if (sBv1 < sAv1 && within(sBv2, [
                sAv1,
                sAv2
            ])) {
            return after;
        } else if (sAv2 === sBv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sAv1,
                    sBv2
                ],
                count: count,
                meta: 'disjoint-before'
            };
        } else if (sBv2 === sAv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sBv1,
                    sAv2
                ],
                count: count,
                meta: 'disjoint-after'
            };
        }
        if (!isNaN(count)) {
            return {
                count: count,
                meta: 'disjoint'
            };
        }
    };
    var cleanUp = function (value, enumData) {
        if (!value) {
            return enumData;
        }
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!value.length) {
            return enumData;
        }
        return value;
    };
    var stringConvert = {
        '0': false,
        'false': false,
        'null': undefined,
        'undefined': undefined
    };
    var convertToBoolean = function (value) {
        if (typeof value === 'string') {
            return value.toLowerCase() in stringConvert ? stringConvert[value.toLowerCase()] : true;
        }
        return value;
    };
    module.exports = {
        'enum': function (prop, enumData) {
            var compares = new clause.Where({});
            compares[prop] = function (vA, vB, A, B) {
                vA = cleanUp(vA, enumData);
                vB = cleanUp(vB, enumData);
                var data = h.arrayUnionIntersectionDifference(vA, vB);
                if (!data.difference.length) {
                    delete data.difference;
                }
                each(data, function (value, prop) {
                    if (Array.isArray(value)) {
                        if (h.arraySame(enumData, value)) {
                            data[prop] = undefined;
                        } else if (value.length === 1) {
                            data[prop] = value[0];
                        }
                    }
                });
                return data;
            };
            return compares;
        },
        rangeInclusive: function (startIndexProperty, endIndexProperty) {
            var compares = {};
            var makeResult = function (result, index) {
                var res = {};
                each([
                    'intersection',
                    'difference',
                    'union'
                ], function (prop) {
                    if (result[prop]) {
                        res[prop] = result[prop][index];
                    }
                });
                if (result.count) {
                    res.count = result.count;
                }
                return res;
            };
            compares[startIndexProperty] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var res = diff(A, B, startIndexProperty, endIndexProperty);
                var result = makeResult(res, 0);
                result.getSubset = function (a, b, bItems, algebra, options) {
                    return bItems;
                };
                result.getUnion = function (a, b, aItems, bItems, algebra, options) {
                    return [
                        aItems,
                        bItems
                    ];
                };
                return result;
            };
            compares[endIndexProperty] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var data = diff(A, B, startIndexProperty, endIndexProperty);
                var res = makeResult(data, 1);
                res.getSubset = function (a, b, bItems, algebra, options) {
                    var numProps = numericProperties(a, b, startIndexProperty, endIndexProperty);
                    var aStartValue = numProps.sAv1, aEndValue = numProps.sAv2;
                    var bStartValue = numProps.sBv1;
                    if (!(endIndexProperty in b) || !(endIndexProperty in a)) {
                        return bItems.slice(aStartValue, aEndValue + 1);
                    }
                    return bItems.slice(aStartValue - bStartValue, aEndValue - bStartValue + 1);
                };
                res.getUnion = function (a, b, aItems, bItems, algebra, options) {
                    if (data.meta.indexOf('after') >= 0) {
                        if (data.intersection) {
                            bItems = bItems.slice(0, data.intersection[0] - +b[startIndexProperty]);
                        }
                        return [
                            bItems,
                            aItems
                        ];
                    }
                    if (data.intersection) {
                        aItems = aItems.slice(0, data.intersection[0] - +a[startIndexProperty]);
                    }
                    return [
                        aItems,
                        bItems
                    ];
                };
                return res;
            };
            return new clause.Paginate(compares);
        },
        'boolean': function (propertyName) {
            var compares = new clause.Where({});
            compares[propertyName] = function (propA, propB) {
                propA = convertToBoolean(propA);
                propB = convertToBoolean(propB);
                var notA = !propA, notB = !propB;
                if (propA === notB && propB === notA) {
                    return {
                        difference: !propB,
                        union: undefined
                    };
                } else if (propA === undefined) {
                    return {
                        difference: !propB,
                        intersection: propB,
                        union: undefined
                    };
                } else if (propA === propB) {
                    return true;
                }
            };
            return compares;
        },
        'sort': function (prop, sortFunc) {
            if (!sortFunc) {
                sortFunc = h.defaultSort;
            }
            var compares = {};
            compares[prop] = sortFunc;
            return new clause.Order(compares);
        },
        'id': function (prop) {
            var compares = {};
            compares[prop] = prop;
            return new clause.Id(compares);
        }
    };
});
/*can-set@0.6.0-pre.4#src/set*/
define('fixture-can-set/src/set', function (require, exports, module) {
    var set = require('fixture-can-set/src/set-core');
    var comparators = require('fixture-can-set/src/comparators');
    set.comparators = comparators;
    set.helpers = require('fixture-can-set/src/helpers');
    if (typeof window !== 'undefined' && !require.resolve) {
        window.set = set;
    }
    module.exports = set;
});
/*can-util@3.0.0-pre.27#js/is-array/is-array*/
define('can-util@3.0.0-pre.27#js/is-array/is-array', function (require, exports, module) {
    module.exports = function (arr) {
        return Array.isArray(arr);
    };
});
/*can-util@3.0.0-pre.27#js/string/string*/
define('can-util@3.0.0-pre.27#js/string/string', function (require, exports, module) {
    var isArray = require('../is-array/is-array');
    var strUndHash = /_|-/, strColons = /\=\=/, strWords = /([A-Z]+)([A-Z][a-z])/g, strLowUp = /([a-z\d])([A-Z])/g, strDash = /([a-z\d])([A-Z])/g, strReplacer = /\{([^\}]+)\}/g, strQuote = /"/g, strSingleQuote = /'/g, strHyphenMatch = /-+(.)?/g, strCamelMatch = /[a-z][A-Z]/g, getNext = function (obj, prop, add) {
            var result = obj[prop];
            if (result === undefined && add === true) {
                result = obj[prop] = {};
            }
            return result;
        }, isContainer = function (current) {
            return /^f|^o/.test(typeof current);
        }, convertBadValues = function (content) {
            var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
            return '' + (isInvalid ? '' : content);
        };
    var string = {
        esc: function (content) {
            return convertBadValues(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(strQuote, '&#34;').replace(strSingleQuote, '&#39;');
        },
        getObject: function (name, roots, add) {
            var parts = name ? name.split('.') : [], length = parts.length, current, r = 0, i, container, rootsLength;
            roots = isArray(roots) ? roots : [roots || window];
            rootsLength = roots.length;
            if (!length) {
                return roots[0];
            }
            for (r; r < rootsLength; r++) {
                current = roots[r];
                container = undefined;
                for (i = 0; i < length && isContainer(current); i++) {
                    container = current;
                    current = getNext(container, parts[i]);
                }
                if (container !== undefined && current !== undefined) {
                    break;
                }
            }
            if (add === false && current !== undefined) {
                delete container[parts[i - 1]];
            }
            if (add === true && current === undefined) {
                current = roots[0];
                for (i = 0; i < length && isContainer(current); i++) {
                    current = getNext(current, parts[i], true);
                }
            }
            return current;
        },
        capitalize: function (s, cache) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        camelize: function (str) {
            return convertBadValues(str).replace(strHyphenMatch, function (match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        },
        hyphenate: function (str) {
            return convertBadValues(str).replace(strCamelMatch, function (str, offset) {
                return str.charAt(0) + '-' + str.charAt(1).toLowerCase();
            });
        },
        underscore: function (s) {
            return s.replace(strColons, '/').replace(strWords, '$1_$2').replace(strLowUp, '$1_$2').replace(strDash, '_').toLowerCase();
        },
        sub: function (str, data, remove) {
            var obs = [];
            str = str || '';
            obs.push(str.replace(strReplacer, function (whole, inside) {
                var ob = string.getObject(inside, data, remove === true ? false : undefined);
                if (ob === undefined || ob === null) {
                    obs = null;
                    return '';
                }
                if (isContainer(ob) && obs) {
                    obs.push(ob);
                    return '';
                }
                return '' + ob;
            }));
            return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
        },
        replacer: strReplacer,
        undHash: strUndHash
    };
    module.exports = string;
});
/*can-connect@0.6.0-pre.4#can-connect*/
define('fixture-can-connect/can-connect', function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var connect = function (behaviors, options) {
        behaviors = behaviors.map(function (behavior, index) {
            var sortedIndex;
            if (typeof behavior === 'string') {
                sortedIndex = connect.order.indexOf(behavior);
                behavior = behaviorsMap[behavior];
            } else if (behavior.isBehavior) {
            } else {
                behavior = connect.behavior(behavior);
            }
            return {
                originalIndex: index,
                sortedIndex: sortedIndex,
                behavior: behavior
            };
        }).sort(function (b1, b2) {
            if (b1.sortedIndex != null && b2.sortedIndex != null) {
                return b1.sortedIndex - b2.sortedIndex;
            }
            return b1.originalIndex - b2.originalIndex;
        });
        behaviors = behaviors.map(function (b) {
            return b.behavior;
        });
        var behavior = core(connect.behavior('options', function () {
            return options;
        })());
        behaviors.forEach(function (behave) {
            behavior = behave(behavior);
        });
        if (behavior.init) {
            behavior.init();
        }
        return behavior;
    };
    connect.order = [
        'data-localstorage-cache',
        'data-url',
        'data-parse',
        'cache-requests',
        'data-combine-requests',
        'constructor',
        'constructor-store',
        'can-map',
        'fall-through-cache',
        'data-inline-cache',
        'data-worker',
        'data-callbacks-cache',
        'data-callbacks',
        'constructor-callbacks-once'
    ];
    connect.behavior = function (name, behavior) {
        if (typeof name !== 'string') {
            behavior = name;
            name = undefined;
        }
        var behaviorMixin = function (base) {
            var Behavior = function () {
            };
            Behavior.name = name;
            Behavior.prototype = base;
            var newBehavior = new Behavior();
            var res = typeof behavior === 'function' ? behavior.apply(newBehavior, arguments) : behavior;
            assign(newBehavior, res);
            newBehavior.__behaviorName = name;
            return newBehavior;
        };
        if (name) {
            behaviorMixin.name = name;
            behaviorsMap[name] = behaviorMixin;
        }
        behaviorMixin.isBehavior = true;
        return behaviorMixin;
    };
    var behaviorsMap = {};
    var core = connect.behavior('base', function (base) {
        return {
            id: function (instance) {
                var ids = [], algebra = this.algebra;
                if (algebra && algebra.clauses && algebra.clauses.id) {
                    for (var prop in algebra.clauses.id) {
                        ids.push(instance[prop]);
                    }
                }
                if (this.idProp && !ids.length) {
                    ids.push(instance[this.idProp]);
                }
                if (!ids.length) {
                    ids.push(instance.id);
                }
                return ids.length > 1 ? ids.join('@|@') : ids[0];
            },
            idProp: base.idProp || 'id',
            listSet: function (list) {
                return list[this.listSetProp];
            },
            listSetProp: '__listSet',
            init: function () {
            }
        };
    });
    connect.base = core;
    module.exports = connect;
});
/*helpers/getid*/
define('can-fixture/helpers/getid', function (require, exports, module) {
    module.exports = function (xhrSettings, fixtureSettings) {
        var id = xhrSettings.data.id;
        if (id === undefined && typeof xhrSettings.data === 'number') {
            id = xhrSettings.data;
        }
        if (id === undefined) {
            xhrSettings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
                id = num;
            });
        }
        if (id === undefined) {
            id = xhrSettings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
                if (num !== 'update') {
                    id = num;
                }
            });
        }
        if (id === undefined) {
            id = Math.round(Math.random() * 1000);
        }
        return id;
    };
});
/*helpers/legacyStore*/
define('can-fixture/helpers/legacyStore', function (require, exports, module) {
    var getId = require('can-fixture/helpers/getid');
    var canSet = require('fixture-can-set/src/set');
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    var each = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    module.exports = function (count, make, filter) {
        var currentId = 0, items, findOne = function (id) {
                for (var i = 0; i < items.length; i++) {
                    if (id == items[i].id) {
                        return items[i];
                    }
                }
            }, methods = {}, types, reset;
        if (isArrayLike(count) && typeof count[0] === 'string') {
            types = count;
            count = make;
            make = filter;
            filter = arguments[3];
        } else if (typeof count === 'string') {
            types = [
                count + 's',
                count
            ];
            count = make;
            make = filter;
            filter = arguments[3];
        }
        if (typeof count === 'number') {
            items = [];
            reset = function () {
                items = [];
                for (var i = 0; i < count; i++) {
                    var item = make(i, items);
                    if (!item.id) {
                        item.id = i;
                    }
                    currentId = Math.max(item.id + 1, currentId + 1) || items.length;
                    items.push(item);
                }
            };
        } else {
            filter = make;
            var initialItems = count;
            reset = function () {
                items = initialItems.slice(0);
            };
        }
        assign(methods, {
            getListData: function (request) {
                request = request || {};
                var retArr = items.slice(0);
                request.data = request.data || {};
                each((request.data.order || []).slice(0).reverse(), function (name) {
                    var split = name.split(' ');
                    retArr = retArr.sort(function (a, b) {
                        if (split[1].toUpperCase() !== 'ASC') {
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
                each((request.data.group || []).slice(0).reverse(), function (name) {
                    var split = name.split(' ');
                    retArr = retArr.sort(function (a, b) {
                        return a[split[0]] > b[split[0]];
                    });
                });
                var offset = parseInt(request.data.offset, 10) || 0, limit = parseInt(request.data.limit, 10) || items.length - offset, i = 0;
                for (var param in request.data) {
                    i = 0;
                    if (request.data[param] !== undefined && (param.indexOf('Id') !== -1 || param.indexOf('_id') !== -1)) {
                        while (i < retArr.length) {
                            if (request.data[param] != retArr[i][param]) {
                                retArr.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                    }
                }
                if (typeof filter === 'function') {
                    i = 0;
                    while (i < retArr.length) {
                        if (!filter(retArr[i], request)) {
                            retArr.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                } else if (typeof filter === 'object') {
                    i = 0;
                    while (i < retArr.length) {
                        var subset = canSet.subset(retArr[i], request.data, filter);
                        if (!subset) {
                            retArr.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
                var responseData = {
                    'count': retArr.length,
                    'data': retArr.slice(offset, offset + limit)
                };
                each([
                    'limit',
                    'offset'
                ], function (prop) {
                    if (prop in request.data) {
                        responseData[prop] = request.data[prop];
                    }
                });
                return responseData;
            },
            getData: function (request, response) {
                var item = findOne(getId(request));
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                response(item);
            },
            updateData: function (request, response) {
                var id = getId(request), item = findOne(id);
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                assign(item, request.data);
                response({ id: id }, { location: request.url || '/' + getId(request) });
            },
            destroyData: function (request, response) {
                var id = getId(request), item = findOne(id);
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                for (var i = 0; i < items.length; i++) {
                    if (items[i].id == id) {
                        items.splice(i, 1);
                        break;
                    }
                }
                return {};
            },
            createData: function (settings, response) {
                var item = typeof make === 'function' ? make(items.length, items) : {};
                assign(item, settings.data);
                if (!item.id) {
                    item.id = currentId++;
                }
                items.push(item);
                response({ id: item.id }, { location: settings.url + '/' + item.id });
            }
        });
        reset();
        return assign({
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
});
/*can-connect@0.6.0-pre.4#helpers/get-items*/
define('fixture-can-connect/helpers/get-items', function (require, exports, module) {
    var isArray = require('can-util/js/is-array/is-array');
    module.exports = function (data) {
        if (isArray(data)) {
            return data;
        } else {
            return data.data;
        }
    };
});
/*when@3.7.7#es6-shim/Promise*/
define('when@3.7.7#es6-shim/Promise', [
    'module',
    '@loader'
], function (module, loader) {
    loader.get('@@global-helpers').prepareGlobal(module.id, []);
    var define = loader.global.define;
    var require = loader.global.require;
    var source = '!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Promise=e():"undefined"!=typeof global?global.Promise=e():"undefined"!=typeof self&&(self.Promise=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n/** @license MIT License (c) copyright 2010-2014 original author or authors */\n/** @author Brian Cavalier */\n/** @author John Hann */\n\n/**\n * ES6 global Promise shim\n */\nvar unhandledRejections = require(\'../lib/decorators/unhandledRejection\');\nvar PromiseConstructor = unhandledRejections(require(\'../lib/Promise\'));\n\nmodule.exports = typeof global != \'undefined\' ? (global.Promise = PromiseConstructor)\n\t           : typeof self   != \'undefined\' ? (self.Promise   = PromiseConstructor)\n\t           : PromiseConstructor;\n\n},{"../lib/Promise":2,"../lib/decorators/unhandledRejection":4}],2:[function(require,module,exports){\n/** @license MIT License (c) copyright 2010-2014 original author or authors */\n/** @author Brian Cavalier */\n/** @author John Hann */\n\n(function(define) { \'use strict\';\ndefine(function (require) {\n\n\tvar makePromise = require(\'./makePromise\');\n\tvar Scheduler = require(\'./Scheduler\');\n\tvar async = require(\'./env\').asap;\n\n\treturn makePromise({\n\t\tscheduler: new Scheduler(async)\n\t});\n\n});\n})(typeof define === \'function\' && define.amd ? define : function (factory) { module.exports = factory(require); });\n\n},{"./Scheduler":3,"./env":5,"./makePromise":7}],3:[function(require,module,exports){\n/** @license MIT License (c) copyright 2010-2014 original author or authors */\n/** @author Brian Cavalier */\n/** @author John Hann */\n\n(function(define) { \'use strict\';\ndefine(function() {\n\n\t// Credit to Twisol (https://github.com/Twisol) for suggesting\n\t// this type of extensible queue + trampoline approach for next-tick conflation.\n\n\t/**\n\t * Async task scheduler\n\t * @param {function} async function to schedule a single async function\n\t * @constructor\n\t */\n\tfunction Scheduler(async) {\n\t\tthis._async = async;\n\t\tthis._running = false;\n\n\t\tthis._queue = this;\n\t\tthis._queueLen = 0;\n\t\tthis._afterQueue = {};\n\t\tthis._afterQueueLen = 0;\n\n\t\tvar self = this;\n\t\tthis.drain = function() {\n\t\t\tself._drain();\n\t\t};\n\t}\n\n\t/**\n\t * Enqueue a task\n\t * @param {{ run:function }} task\n\t */\n\tScheduler.prototype.enqueue = function(task) {\n\t\tthis._queue[this._queueLen++] = task;\n\t\tthis.run();\n\t};\n\n\t/**\n\t * Enqueue a task to run after the main task queue\n\t * @param {{ run:function }} task\n\t */\n\tScheduler.prototype.afterQueue = function(task) {\n\t\tthis._afterQueue[this._afterQueueLen++] = task;\n\t\tthis.run();\n\t};\n\n\tScheduler.prototype.run = function() {\n\t\tif (!this._running) {\n\t\t\tthis._running = true;\n\t\t\tthis._async(this.drain);\n\t\t}\n\t};\n\n\t/**\n\t * Drain the handler queue entirely, and then the after queue\n\t */\n\tScheduler.prototype._drain = function() {\n\t\tvar i = 0;\n\t\tfor (; i < this._queueLen; ++i) {\n\t\t\tthis._queue[i].run();\n\t\t\tthis._queue[i] = void 0;\n\t\t}\n\n\t\tthis._queueLen = 0;\n\t\tthis._running = false;\n\n\t\tfor (i = 0; i < this._afterQueueLen; ++i) {\n\t\t\tthis._afterQueue[i].run();\n\t\t\tthis._afterQueue[i] = void 0;\n\t\t}\n\n\t\tthis._afterQueueLen = 0;\n\t};\n\n\treturn Scheduler;\n\n});\n}(typeof define === \'function\' && define.amd ? define : function(factory) { module.exports = factory(); }));\n\n},{}],4:[function(require,module,exports){\n/** @license MIT License (c) copyright 2010-2014 original author or authors */\n/** @author Brian Cavalier */\n/** @author John Hann */\n\n(function(define) { \'use strict\';\ndefine(function(require) {\n\n\tvar setTimer = require(\'../env\').setTimer;\n\tvar format = require(\'../format\');\n\n\treturn function unhandledRejection(Promise) {\n\n\t\tvar logError = noop;\n\t\tvar logInfo = noop;\n\t\tvar localConsole;\n\n\t\tif(typeof console !== \'undefined\') {\n\t\t\t// Alias console to prevent things like uglify\'s drop_console option from\n\t\t\t// removing console.log/error. Unhandled rejections fall into the same\n\t\t\t// category as uncaught exceptions, and build tools shouldn\'t silence them.\n\t\t\tlocalConsole = console;\n\t\t\tlogError = typeof localConsole.error !== \'undefined\'\n\t\t\t\t? function (e) { localConsole.error(e); }\n\t\t\t\t: function (e) { localConsole.log(e); };\n\n\t\t\tlogInfo = typeof localConsole.info !== \'undefined\'\n\t\t\t\t? function (e) { localConsole.info(e); }\n\t\t\t\t: function (e) { localConsole.log(e); };\n\t\t}\n\n\t\tPromise.onPotentiallyUnhandledRejection = function(rejection) {\n\t\t\tenqueue(report, rejection);\n\t\t};\n\n\t\tPromise.onPotentiallyUnhandledRejectionHandled = function(rejection) {\n\t\t\tenqueue(unreport, rejection);\n\t\t};\n\n\t\tPromise.onFatalRejection = function(rejection) {\n\t\t\tenqueue(throwit, rejection.value);\n\t\t};\n\n\t\tvar tasks = [];\n\t\tvar reported = [];\n\t\tvar running = null;\n\n\t\tfunction report(r) {\n\t\t\tif(!r.handled) {\n\t\t\t\treported.push(r);\n\t\t\t\tlogError(\'Potentially unhandled rejection [\' + r.id + \'] \' + format.formatError(r.value));\n\t\t\t}\n\t\t}\n\n\t\tfunction unreport(r) {\n\t\t\tvar i = reported.indexOf(r);\n\t\t\tif(i >= 0) {\n\t\t\t\treported.splice(i, 1);\n\t\t\t\tlogInfo(\'Handled previous rejection [\' + r.id + \'] \' + format.formatObject(r.value));\n\t\t\t}\n\t\t}\n\n\t\tfunction enqueue(f, x) {\n\t\t\ttasks.push(f, x);\n\t\t\tif(running === null) {\n\t\t\t\trunning = setTimer(flush, 0);\n\t\t\t}\n\t\t}\n\n\t\tfunction flush() {\n\t\t\trunning = null;\n\t\t\twhile(tasks.length > 0) {\n\t\t\t\ttasks.shift()(tasks.shift());\n\t\t\t}\n\t\t}\n\n\t\treturn Promise;\n\t};\n\n\tfunction throwit(e) {\n\t\tthrow e;\n\t}\n\n\tfunction noop() {}\n\n});\n}(typeof define === \'function\' && define.amd ? define : function(factory) { module.exports = factory(require); }));\n\n},{"../env":5,"../format":6}],5:[function(require,module,exports){\n/** @license MIT License (c) copyright 2010-2014 original author or authors */\n/** @author Brian Cavalier */\n/** @author John Hann */\n\n/*global process,document,setTimeout,clearTimeout,MutationObserver,WebKitMutationObserver*/\n(function(define) { \'use strict\';\ndefine(function(require) {\n\t/*jshint maxcomplexity:6*/\n\n\t// Sniff "best" async scheduling option\n\t// Prefer process.nextTick or MutationObserver, then check for\n\t// setTimeout, and finally vertx, since its the only env that doesn\'t\n\t// have setTimeout\n\n\tvar MutationObs;\n\tvar capturedSetTimeout = typeof setTimeout !== \'undefined\' && setTimeout;\n\n\t// Default env\n\tvar setTimer = function(f, ms) { return setTimeout(f, ms); };\n\tvar clearTimer = function(t) { return clearTimeout(t); };\n\tvar asap = function (f) { return capturedSetTimeout(f, 0); };\n\n\t// Detect specific env\n\tif (isNode()) { // Node\n\t\tasap = function (f) { return process.nextTick(f); };\n\n\t} else if (MutationObs = hasMutationObserver()) { // Modern browser\n\t\tasap = initMutationObserver(MutationObs);\n\n\t} else if (!capturedSetTimeout) { // vert.x\n\t\tvar vertxRequire = require;\n\t\tvar vertx = vertxRequire(\'vertx\');\n\t\tsetTimer = function (f, ms) { return vertx.setTimer(ms, f); };\n\t\tclearTimer = vertx.cancelTimer;\n\t\tasap = vertx.runOnLoop || vertx.runOnContext;\n\t}\n\n\treturn {\n\t\tsetTimer: setTimer,\n\t\tclearTimer: clearTimer,\n\t\tasap: asap\n\t};\n\n\tfunction isNode () {\n\t\treturn typeof process !== \'undefined\' &&\n\t\t\tObject.prototype.toString.call(process) === \'[object process]\';\n\t}\n\n\tfunction hasMutationObserver () {\n\t\treturn (typeof MutationObserver === \'function\' && MutationObserver) ||\n\t\t\t(typeof WebKitMutationObserver === \'function\' && WebKitMutationObserver);\n\t}\n\n\tfunction initMutationObserver(MutationObserver) {\n\t\tvar scheduled;\n\t\tvar node = document.createTextNode(\'\');\n\t\tvar o = new MutationObserver(run);\n\t\to.observe(node, { characterData: true });\n\n\t\tfunction run() {\n\t\t\tvar f = scheduled;\n\t\t\tscheduled = void 0;\n\t\t\tf();\n\t\t}\n\n\t\tvar i = 0;\n\t\treturn function (f) {\n\t\t\tscheduled = f;\n\t\t\tnode.data = (i ^= 1);\n\t\t};\n\t}\n});\n}(typeof define === \'function\' && define.amd ? define : function(factory) { module.exports = factory(require); }));\n\n},{}],6:[function(require,module,exports){\n/** @license MIT License (c) copyright 2010-2014 original author or authors */\n/** @author Brian Cavalier */\n/** @author John Hann */\n\n(function(define) { \'use strict\';\ndefine(function() {\n\n\treturn {\n\t\tformatError: formatError,\n\t\tformatObject: formatObject,\n\t\ttryStringify: tryStringify\n\t};\n\n\t/**\n\t * Format an error into a string.  If e is an Error and has a stack property,\n\t * it\'s returned.  Otherwise, e is formatted using formatObject, with a\n\t * warning added about e not being a proper Error.\n\t * @param {*} e\n\t * @returns {String} formatted string, suitable for output to developers\n\t */\n\tfunction formatError(e) {\n\t\tvar s = typeof e === \'object\' && e !== null && (e.stack || e.message) ? e.stack || e.message : formatObject(e);\n\t\treturn e instanceof Error ? s : s + \' (WARNING: non-Error used)\';\n\t}\n\n\t/**\n\t * Format an object, detecting "plain" objects and running them through\n\t * JSON.stringify if possible.\n\t * @param {Object} o\n\t * @returns {string}\n\t */\n\tfunction formatObject(o) {\n\t\tvar s = String(o);\n\t\tif(s === \'[object Object]\' && typeof JSON !== \'undefined\') {\n\t\t\ts = tryStringify(o, s);\n\t\t}\n\t\treturn s;\n\t}\n\n\t/**\n\t * Try to return the result of JSON.stringify(x).  If that fails, return\n\t * defaultValue\n\t * @param {*} x\n\t * @param {*} defaultValue\n\t * @returns {String|*} JSON.stringify(x) or defaultValue\n\t */\n\tfunction tryStringify(x, defaultValue) {\n\t\ttry {\n\t\t\treturn JSON.stringify(x);\n\t\t} catch(e) {\n\t\t\treturn defaultValue;\n\t\t}\n\t}\n\n});\n}(typeof define === \'function\' && define.amd ? define : function(factory) { module.exports = factory(); }));\n\n},{}],7:[function(require,module,exports){\n/** @license MIT License (c) copyright 2010-2014 original author or authors */\n/** @author Brian Cavalier */\n/** @author John Hann */\n\n(function(define) { \'use strict\';\ndefine(function() {\n\n\treturn function makePromise(environment) {\n\n\t\tvar tasks = environment.scheduler;\n\t\tvar emitRejection = initEmitRejection();\n\n\t\tvar objectCreate = Object.create ||\n\t\t\tfunction(proto) {\n\t\t\t\tfunction Child() {}\n\t\t\t\tChild.prototype = proto;\n\t\t\t\treturn new Child();\n\t\t\t};\n\n\t\t/**\n\t\t * Create a promise whose fate is determined by resolver\n\t\t * @constructor\n\t\t * @returns {Promise} promise\n\t\t * @name Promise\n\t\t */\n\t\tfunction Promise(resolver, handler) {\n\t\t\tthis._handler = resolver === Handler ? handler : init(resolver);\n\t\t}\n\n\t\t/**\n\t\t * Run the supplied resolver\n\t\t * @param resolver\n\t\t * @returns {Pending}\n\t\t */\n\t\tfunction init(resolver) {\n\t\t\tvar handler = new Pending();\n\n\t\t\ttry {\n\t\t\t\tresolver(promiseResolve, promiseReject, promiseNotify);\n\t\t\t} catch (e) {\n\t\t\t\tpromiseReject(e);\n\t\t\t}\n\n\t\t\treturn handler;\n\n\t\t\t/**\n\t\t\t * Transition from pre-resolution state to post-resolution state, notifying\n\t\t\t * all listeners of the ultimate fulfillment or rejection\n\t\t\t * @param {*} x resolution value\n\t\t\t */\n\t\t\tfunction promiseResolve (x) {\n\t\t\t\thandler.resolve(x);\n\t\t\t}\n\t\t\t/**\n\t\t\t * Reject this promise with reason, which will be used verbatim\n\t\t\t * @param {Error|*} reason rejection reason, strongly suggested\n\t\t\t *   to be an Error type\n\t\t\t */\n\t\t\tfunction promiseReject (reason) {\n\t\t\t\thandler.reject(reason);\n\t\t\t}\n\n\t\t\t/**\n\t\t\t * @deprecated\n\t\t\t * Issue a progress event, notifying all progress listeners\n\t\t\t * @param {*} x progress event payload to pass to all listeners\n\t\t\t */\n\t\t\tfunction promiseNotify (x) {\n\t\t\t\thandler.notify(x);\n\t\t\t}\n\t\t}\n\n\t\t// Creation\n\n\t\tPromise.resolve = resolve;\n\t\tPromise.reject = reject;\n\t\tPromise.never = never;\n\n\t\tPromise._defer = defer;\n\t\tPromise._handler = getHandler;\n\n\t\t/**\n\t\t * Returns a trusted promise. If x is already a trusted promise, it is\n\t\t * returned, otherwise returns a new trusted Promise which follows x.\n\t\t * @param  {*} x\n\t\t * @return {Promise} promise\n\t\t */\n\t\tfunction resolve(x) {\n\t\t\treturn isPromise(x) ? x\n\t\t\t\t: new Promise(Handler, new Async(getHandler(x)));\n\t\t}\n\n\t\t/**\n\t\t * Return a reject promise with x as its reason (x is used verbatim)\n\t\t * @param {*} x\n\t\t * @returns {Promise} rejected promise\n\t\t */\n\t\tfunction reject(x) {\n\t\t\treturn new Promise(Handler, new Async(new Rejected(x)));\n\t\t}\n\n\t\t/**\n\t\t * Return a promise that remains pending forever\n\t\t * @returns {Promise} forever-pending promise.\n\t\t */\n\t\tfunction never() {\n\t\t\treturn foreverPendingPromise; // Should be frozen\n\t\t}\n\n\t\t/**\n\t\t * Creates an internal {promise, resolver} pair\n\t\t * @private\n\t\t * @returns {Promise}\n\t\t */\n\t\tfunction defer() {\n\t\t\treturn new Promise(Handler, new Pending());\n\t\t}\n\n\t\t// Transformation and flow control\n\n\t\t/**\n\t\t * Transform this promise\'s fulfillment value, returning a new Promise\n\t\t * for the transformed result.  If the promise cannot be fulfilled, onRejected\n\t\t * is called with the reason.  onProgress *may* be called with updates toward\n\t\t * this promise\'s fulfillment.\n\t\t * @param {function=} onFulfilled fulfillment handler\n\t\t * @param {function=} onRejected rejection handler\n\t\t * @param {function=} onProgress @deprecated progress handler\n\t\t * @return {Promise} new promise\n\t\t */\n\t\tPromise.prototype.then = function(onFulfilled, onRejected, onProgress) {\n\t\t\tvar parent = this._handler;\n\t\t\tvar state = parent.join().state();\n\n\t\t\tif ((typeof onFulfilled !== \'function\' && state > 0) ||\n\t\t\t\t(typeof onRejected !== \'function\' && state < 0)) {\n\t\t\t\t// Short circuit: value will not change, simply share handler\n\t\t\t\treturn new this.constructor(Handler, parent);\n\t\t\t}\n\n\t\t\tvar p = this._beget();\n\t\t\tvar child = p._handler;\n\n\t\t\tparent.chain(child, parent.receiver, onFulfilled, onRejected, onProgress);\n\n\t\t\treturn p;\n\t\t};\n\n\t\t/**\n\t\t * If this promise cannot be fulfilled due to an error, call onRejected to\n\t\t * handle the error. Shortcut for .then(undefined, onRejected)\n\t\t * @param {function?} onRejected\n\t\t * @return {Promise}\n\t\t */\n\t\tPromise.prototype[\'catch\'] = function(onRejected) {\n\t\t\treturn this.then(void 0, onRejected);\n\t\t};\n\n\t\t/**\n\t\t * Creates a new, pending promise of the same type as this promise\n\t\t * @private\n\t\t * @returns {Promise}\n\t\t */\n\t\tPromise.prototype._beget = function() {\n\t\t\treturn begetFrom(this._handler, this.constructor);\n\t\t};\n\n\t\tfunction begetFrom(parent, Promise) {\n\t\t\tvar child = new Pending(parent.receiver, parent.join().context);\n\t\t\treturn new Promise(Handler, child);\n\t\t}\n\n\t\t// Array combinators\n\n\t\tPromise.all = all;\n\t\tPromise.race = race;\n\t\tPromise._traverse = traverse;\n\n\t\t/**\n\t\t * Return a promise that will fulfill when all promises in the\n\t\t * input array have fulfilled, or will reject when one of the\n\t\t * promises rejects.\n\t\t * @param {array} promises array of promises\n\t\t * @returns {Promise} promise for array of fulfillment values\n\t\t */\n\t\tfunction all(promises) {\n\t\t\treturn traverseWith(snd, null, promises);\n\t\t}\n\n\t\t/**\n\t\t * Array<Promise<X>> -> Promise<Array<f(X)>>\n\t\t * @private\n\t\t * @param {function} f function to apply to each promise\'s value\n\t\t * @param {Array} promises array of promises\n\t\t * @returns {Promise} promise for transformed values\n\t\t */\n\t\tfunction traverse(f, promises) {\n\t\t\treturn traverseWith(tryCatch2, f, promises);\n\t\t}\n\n\t\tfunction traverseWith(tryMap, f, promises) {\n\t\t\tvar handler = typeof f === \'function\' ? mapAt : settleAt;\n\n\t\t\tvar resolver = new Pending();\n\t\t\tvar pending = promises.length >>> 0;\n\t\t\tvar results = new Array(pending);\n\n\t\t\tfor (var i = 0, x; i < promises.length && !resolver.resolved; ++i) {\n\t\t\t\tx = promises[i];\n\n\t\t\t\tif (x === void 0 && !(i in promises)) {\n\t\t\t\t\t--pending;\n\t\t\t\t\tcontinue;\n\t\t\t\t}\n\n\t\t\t\ttraverseAt(promises, handler, i, x, resolver);\n\t\t\t}\n\n\t\t\tif(pending === 0) {\n\t\t\t\tresolver.become(new Fulfilled(results));\n\t\t\t}\n\n\t\t\treturn new Promise(Handler, resolver);\n\n\t\t\tfunction mapAt(i, x, resolver) {\n\t\t\t\tif(!resolver.resolved) {\n\t\t\t\t\ttraverseAt(promises, settleAt, i, tryMap(f, x, i), resolver);\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tfunction settleAt(i, x, resolver) {\n\t\t\t\tresults[i] = x;\n\t\t\t\tif(--pending === 0) {\n\t\t\t\t\tresolver.become(new Fulfilled(results));\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\tfunction traverseAt(promises, handler, i, x, resolver) {\n\t\t\tif (maybeThenable(x)) {\n\t\t\t\tvar h = getHandlerMaybeThenable(x);\n\t\t\t\tvar s = h.state();\n\n\t\t\t\tif (s === 0) {\n\t\t\t\t\th.fold(handler, i, void 0, resolver);\n\t\t\t\t} else if (s > 0) {\n\t\t\t\t\thandler(i, h.value, resolver);\n\t\t\t\t} else {\n\t\t\t\t\tresolver.become(h);\n\t\t\t\t\tvisitRemaining(promises, i+1, h);\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\thandler(i, x, resolver);\n\t\t\t}\n\t\t}\n\n\t\tPromise._visitRemaining = visitRemaining;\n\t\tfunction visitRemaining(promises, start, handler) {\n\t\t\tfor(var i=start; i<promises.length; ++i) {\n\t\t\t\tmarkAsHandled(getHandler(promises[i]), handler);\n\t\t\t}\n\t\t}\n\n\t\tfunction markAsHandled(h, handler) {\n\t\t\tif(h === handler) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tvar s = h.state();\n\t\t\tif(s === 0) {\n\t\t\t\th.visit(h, void 0, h._unreport);\n\t\t\t} else if(s < 0) {\n\t\t\t\th._unreport();\n\t\t\t}\n\t\t}\n\n\t\t/**\n\t\t * Fulfill-reject competitive race. Return a promise that will settle\n\t\t * to the same state as the earliest input promise to settle.\n\t\t *\n\t\t * WARNING: The ES6 Promise spec requires that race()ing an empty array\n\t\t * must return a promise that is pending forever.  This implementation\n\t\t * returns a singleton forever-pending promise, the same singleton that is\n\t\t * returned by Promise.never(), thus can be checked with ===\n\t\t *\n\t\t * @param {array} promises array of promises to race\n\t\t * @returns {Promise} if input is non-empty, a promise that will settle\n\t\t * to the same outcome as the earliest input promise to settle. if empty\n\t\t * is empty, returns a promise that will never settle.\n\t\t */\n\t\tfunction race(promises) {\n\t\t\tif(typeof promises !== \'object\' || promises === null) {\n\t\t\t\treturn reject(new TypeError(\'non-iterable passed to race()\'));\n\t\t\t}\n\n\t\t\t// Sigh, race([]) is untestable unless we return *something*\n\t\t\t// that is recognizable without calling .then() on it.\n\t\t\treturn promises.length === 0 ? never()\n\t\t\t\t : promises.length === 1 ? resolve(promises[0])\n\t\t\t\t : runRace(promises);\n\t\t}\n\n\t\tfunction runRace(promises) {\n\t\t\tvar resolver = new Pending();\n\t\t\tvar i, x, h;\n\t\t\tfor(i=0; i<promises.length; ++i) {\n\t\t\t\tx = promises[i];\n\t\t\t\tif (x === void 0 && !(i in promises)) {\n\t\t\t\t\tcontinue;\n\t\t\t\t}\n\n\t\t\t\th = getHandler(x);\n\t\t\t\tif(h.state() !== 0) {\n\t\t\t\t\tresolver.become(h);\n\t\t\t\t\tvisitRemaining(promises, i+1, h);\n\t\t\t\t\tbreak;\n\t\t\t\t} else {\n\t\t\t\t\th.visit(resolver, resolver.resolve, resolver.reject);\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn new Promise(Handler, resolver);\n\t\t}\n\n\t\t// Promise internals\n\t\t// Below this, everything is @private\n\n\t\t/**\n\t\t * Get an appropriate handler for x, without checking for cycles\n\t\t * @param {*} x\n\t\t * @returns {object} handler\n\t\t */\n\t\tfunction getHandler(x) {\n\t\t\tif(isPromise(x)) {\n\t\t\t\treturn x._handler.join();\n\t\t\t}\n\t\t\treturn maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);\n\t\t}\n\n\t\t/**\n\t\t * Get a handler for thenable x.\n\t\t * NOTE: You must only call this if maybeThenable(x) == true\n\t\t * @param {object|function|Promise} x\n\t\t * @returns {object} handler\n\t\t */\n\t\tfunction getHandlerMaybeThenable(x) {\n\t\t\treturn isPromise(x) ? x._handler.join() : getHandlerUntrusted(x);\n\t\t}\n\n\t\t/**\n\t\t * Get a handler for potentially untrusted thenable x\n\t\t * @param {*} x\n\t\t * @returns {object} handler\n\t\t */\n\t\tfunction getHandlerUntrusted(x) {\n\t\t\ttry {\n\t\t\t\tvar untrustedThen = x.then;\n\t\t\t\treturn typeof untrustedThen === \'function\'\n\t\t\t\t\t? new Thenable(untrustedThen, x)\n\t\t\t\t\t: new Fulfilled(x);\n\t\t\t} catch(e) {\n\t\t\t\treturn new Rejected(e);\n\t\t\t}\n\t\t}\n\n\t\t/**\n\t\t * Handler for a promise that is pending forever\n\t\t * @constructor\n\t\t */\n\t\tfunction Handler() {}\n\n\t\tHandler.prototype.when\n\t\t\t= Handler.prototype.become\n\t\t\t= Handler.prototype.notify // deprecated\n\t\t\t= Handler.prototype.fail\n\t\t\t= Handler.prototype._unreport\n\t\t\t= Handler.prototype._report\n\t\t\t= noop;\n\n\t\tHandler.prototype._state = 0;\n\n\t\tHandler.prototype.state = function() {\n\t\t\treturn this._state;\n\t\t};\n\n\t\t/**\n\t\t * Recursively collapse handler chain to find the handler\n\t\t * nearest to the fully resolved value.\n\t\t * @returns {object} handler nearest the fully resolved value\n\t\t */\n\t\tHandler.prototype.join = function() {\n\t\t\tvar h = this;\n\t\t\twhile(h.handler !== void 0) {\n\t\t\t\th = h.handler;\n\t\t\t}\n\t\t\treturn h;\n\t\t};\n\n\t\tHandler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {\n\t\t\tthis.when({\n\t\t\t\tresolver: to,\n\t\t\t\treceiver: receiver,\n\t\t\t\tfulfilled: fulfilled,\n\t\t\t\trejected: rejected,\n\t\t\t\tprogress: progress\n\t\t\t});\n\t\t};\n\n\t\tHandler.prototype.visit = function(receiver, fulfilled, rejected, progress) {\n\t\t\tthis.chain(failIfRejected, receiver, fulfilled, rejected, progress);\n\t\t};\n\n\t\tHandler.prototype.fold = function(f, z, c, to) {\n\t\t\tthis.when(new Fold(f, z, c, to));\n\t\t};\n\n\t\t/**\n\t\t * Handler that invokes fail() on any handler it becomes\n\t\t * @constructor\n\t\t */\n\t\tfunction FailIfRejected() {}\n\n\t\tinherit(Handler, FailIfRejected);\n\n\t\tFailIfRejected.prototype.become = function(h) {\n\t\t\th.fail();\n\t\t};\n\n\t\tvar failIfRejected = new FailIfRejected();\n\n\t\t/**\n\t\t * Handler that manages a queue of consumers waiting on a pending promise\n\t\t * @constructor\n\t\t */\n\t\tfunction Pending(receiver, inheritedContext) {\n\t\t\tPromise.createContext(this, inheritedContext);\n\n\t\t\tthis.consumers = void 0;\n\t\t\tthis.receiver = receiver;\n\t\t\tthis.handler = void 0;\n\t\t\tthis.resolved = false;\n\t\t}\n\n\t\tinherit(Handler, Pending);\n\n\t\tPending.prototype._state = 0;\n\n\t\tPending.prototype.resolve = function(x) {\n\t\t\tthis.become(getHandler(x));\n\t\t};\n\n\t\tPending.prototype.reject = function(x) {\n\t\t\tif(this.resolved) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tthis.become(new Rejected(x));\n\t\t};\n\n\t\tPending.prototype.join = function() {\n\t\t\tif (!this.resolved) {\n\t\t\t\treturn this;\n\t\t\t}\n\n\t\t\tvar h = this;\n\n\t\t\twhile (h.handler !== void 0) {\n\t\t\t\th = h.handler;\n\t\t\t\tif (h === this) {\n\t\t\t\t\treturn this.handler = cycle();\n\t\t\t\t}\n\t\t\t}\n\n\t\t\treturn h;\n\t\t};\n\n\t\tPending.prototype.run = function() {\n\t\t\tvar q = this.consumers;\n\t\t\tvar handler = this.handler;\n\t\t\tthis.handler = this.handler.join();\n\t\t\tthis.consumers = void 0;\n\n\t\t\tfor (var i = 0; i < q.length; ++i) {\n\t\t\t\thandler.when(q[i]);\n\t\t\t}\n\t\t};\n\n\t\tPending.prototype.become = function(handler) {\n\t\t\tif(this.resolved) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tthis.resolved = true;\n\t\t\tthis.handler = handler;\n\t\t\tif(this.consumers !== void 0) {\n\t\t\t\ttasks.enqueue(this);\n\t\t\t}\n\n\t\t\tif(this.context !== void 0) {\n\t\t\t\thandler._report(this.context);\n\t\t\t}\n\t\t};\n\n\t\tPending.prototype.when = function(continuation) {\n\t\t\tif(this.resolved) {\n\t\t\t\ttasks.enqueue(new ContinuationTask(continuation, this.handler));\n\t\t\t} else {\n\t\t\t\tif(this.consumers === void 0) {\n\t\t\t\t\tthis.consumers = [continuation];\n\t\t\t\t} else {\n\t\t\t\t\tthis.consumers.push(continuation);\n\t\t\t\t}\n\t\t\t}\n\t\t};\n\n\t\t/**\n\t\t * @deprecated\n\t\t */\n\t\tPending.prototype.notify = function(x) {\n\t\t\tif(!this.resolved) {\n\t\t\t\ttasks.enqueue(new ProgressTask(x, this));\n\t\t\t}\n\t\t};\n\n\t\tPending.prototype.fail = function(context) {\n\t\t\tvar c = typeof context === \'undefined\' ? this.context : context;\n\t\t\tthis.resolved && this.handler.join().fail(c);\n\t\t};\n\n\t\tPending.prototype._report = function(context) {\n\t\t\tthis.resolved && this.handler.join()._report(context);\n\t\t};\n\n\t\tPending.prototype._unreport = function() {\n\t\t\tthis.resolved && this.handler.join()._unreport();\n\t\t};\n\n\t\t/**\n\t\t * Wrap another handler and force it into a future stack\n\t\t * @param {object} handler\n\t\t * @constructor\n\t\t */\n\t\tfunction Async(handler) {\n\t\t\tthis.handler = handler;\n\t\t}\n\n\t\tinherit(Handler, Async);\n\n\t\tAsync.prototype.when = function(continuation) {\n\t\t\ttasks.enqueue(new ContinuationTask(continuation, this));\n\t\t};\n\n\t\tAsync.prototype._report = function(context) {\n\t\t\tthis.join()._report(context);\n\t\t};\n\n\t\tAsync.prototype._unreport = function() {\n\t\t\tthis.join()._unreport();\n\t\t};\n\n\t\t/**\n\t\t * Handler that wraps an untrusted thenable and assimilates it in a future stack\n\t\t * @param {function} then\n\t\t * @param {{then: function}} thenable\n\t\t * @constructor\n\t\t */\n\t\tfunction Thenable(then, thenable) {\n\t\t\tPending.call(this);\n\t\t\ttasks.enqueue(new AssimilateTask(then, thenable, this));\n\t\t}\n\n\t\tinherit(Pending, Thenable);\n\n\t\t/**\n\t\t * Handler for a fulfilled promise\n\t\t * @param {*} x fulfillment value\n\t\t * @constructor\n\t\t */\n\t\tfunction Fulfilled(x) {\n\t\t\tPromise.createContext(this);\n\t\t\tthis.value = x;\n\t\t}\n\n\t\tinherit(Handler, Fulfilled);\n\n\t\tFulfilled.prototype._state = 1;\n\n\t\tFulfilled.prototype.fold = function(f, z, c, to) {\n\t\t\trunContinuation3(f, z, this, c, to);\n\t\t};\n\n\t\tFulfilled.prototype.when = function(cont) {\n\t\t\trunContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);\n\t\t};\n\n\t\tvar errorId = 0;\n\n\t\t/**\n\t\t * Handler for a rejected promise\n\t\t * @param {*} x rejection reason\n\t\t * @constructor\n\t\t */\n\t\tfunction Rejected(x) {\n\t\t\tPromise.createContext(this);\n\n\t\t\tthis.id = ++errorId;\n\t\t\tthis.value = x;\n\t\t\tthis.handled = false;\n\t\t\tthis.reported = false;\n\n\t\t\tthis._report();\n\t\t}\n\n\t\tinherit(Handler, Rejected);\n\n\t\tRejected.prototype._state = -1;\n\n\t\tRejected.prototype.fold = function(f, z, c, to) {\n\t\t\tto.become(this);\n\t\t};\n\n\t\tRejected.prototype.when = function(cont) {\n\t\t\tif(typeof cont.rejected === \'function\') {\n\t\t\t\tthis._unreport();\n\t\t\t}\n\t\t\trunContinuation1(cont.rejected, this, cont.receiver, cont.resolver);\n\t\t};\n\n\t\tRejected.prototype._report = function(context) {\n\t\t\ttasks.afterQueue(new ReportTask(this, context));\n\t\t};\n\n\t\tRejected.prototype._unreport = function() {\n\t\t\tif(this.handled) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tthis.handled = true;\n\t\t\ttasks.afterQueue(new UnreportTask(this));\n\t\t};\n\n\t\tRejected.prototype.fail = function(context) {\n\t\t\tthis.reported = true;\n\t\t\temitRejection(\'unhandledRejection\', this);\n\t\t\tPromise.onFatalRejection(this, context === void 0 ? this.context : context);\n\t\t};\n\n\t\tfunction ReportTask(rejection, context) {\n\t\t\tthis.rejection = rejection;\n\t\t\tthis.context = context;\n\t\t}\n\n\t\tReportTask.prototype.run = function() {\n\t\t\tif(!this.rejection.handled && !this.rejection.reported) {\n\t\t\t\tthis.rejection.reported = true;\n\t\t\t\temitRejection(\'unhandledRejection\', this.rejection) ||\n\t\t\t\t\tPromise.onPotentiallyUnhandledRejection(this.rejection, this.context);\n\t\t\t}\n\t\t};\n\n\t\tfunction UnreportTask(rejection) {\n\t\t\tthis.rejection = rejection;\n\t\t}\n\n\t\tUnreportTask.prototype.run = function() {\n\t\t\tif(this.rejection.reported) {\n\t\t\t\temitRejection(\'rejectionHandled\', this.rejection) ||\n\t\t\t\t\tPromise.onPotentiallyUnhandledRejectionHandled(this.rejection);\n\t\t\t}\n\t\t};\n\n\t\t// Unhandled rejection hooks\n\t\t// By default, everything is a noop\n\n\t\tPromise.createContext\n\t\t\t= Promise.enterContext\n\t\t\t= Promise.exitContext\n\t\t\t= Promise.onPotentiallyUnhandledRejection\n\t\t\t= Promise.onPotentiallyUnhandledRejectionHandled\n\t\t\t= Promise.onFatalRejection\n\t\t\t= noop;\n\n\t\t// Errors and singletons\n\n\t\tvar foreverPendingHandler = new Handler();\n\t\tvar foreverPendingPromise = new Promise(Handler, foreverPendingHandler);\n\n\t\tfunction cycle() {\n\t\t\treturn new Rejected(new TypeError(\'Promise cycle\'));\n\t\t}\n\n\t\t// Task runners\n\n\t\t/**\n\t\t * Run a single consumer\n\t\t * @constructor\n\t\t */\n\t\tfunction ContinuationTask(continuation, handler) {\n\t\t\tthis.continuation = continuation;\n\t\t\tthis.handler = handler;\n\t\t}\n\n\t\tContinuationTask.prototype.run = function() {\n\t\t\tthis.handler.join().when(this.continuation);\n\t\t};\n\n\t\t/**\n\t\t * Run a queue of progress handlers\n\t\t * @constructor\n\t\t */\n\t\tfunction ProgressTask(value, handler) {\n\t\t\tthis.handler = handler;\n\t\t\tthis.value = value;\n\t\t}\n\n\t\tProgressTask.prototype.run = function() {\n\t\t\tvar q = this.handler.consumers;\n\t\t\tif(q === void 0) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tfor (var c, i = 0; i < q.length; ++i) {\n\t\t\t\tc = q[i];\n\t\t\t\trunNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);\n\t\t\t}\n\t\t};\n\n\t\t/**\n\t\t * Assimilate a thenable, sending it\'s value to resolver\n\t\t * @param {function} then\n\t\t * @param {object|function} thenable\n\t\t * @param {object} resolver\n\t\t * @constructor\n\t\t */\n\t\tfunction AssimilateTask(then, thenable, resolver) {\n\t\t\tthis._then = then;\n\t\t\tthis.thenable = thenable;\n\t\t\tthis.resolver = resolver;\n\t\t}\n\n\t\tAssimilateTask.prototype.run = function() {\n\t\t\tvar h = this.resolver;\n\t\t\ttryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);\n\n\t\t\tfunction _resolve(x) { h.resolve(x); }\n\t\t\tfunction _reject(x)  { h.reject(x); }\n\t\t\tfunction _notify(x)  { h.notify(x); }\n\t\t};\n\n\t\tfunction tryAssimilate(then, thenable, resolve, reject, notify) {\n\t\t\ttry {\n\t\t\t\tthen.call(thenable, resolve, reject, notify);\n\t\t\t} catch (e) {\n\t\t\t\treject(e);\n\t\t\t}\n\t\t}\n\n\t\t/**\n\t\t * Fold a handler value with z\n\t\t * @constructor\n\t\t */\n\t\tfunction Fold(f, z, c, to) {\n\t\t\tthis.f = f; this.z = z; this.c = c; this.to = to;\n\t\t\tthis.resolver = failIfRejected;\n\t\t\tthis.receiver = this;\n\t\t}\n\n\t\tFold.prototype.fulfilled = function(x) {\n\t\t\tthis.f.call(this.c, this.z, x, this.to);\n\t\t};\n\n\t\tFold.prototype.rejected = function(x) {\n\t\t\tthis.to.reject(x);\n\t\t};\n\n\t\tFold.prototype.progress = function(x) {\n\t\t\tthis.to.notify(x);\n\t\t};\n\n\t\t// Other helpers\n\n\t\t/**\n\t\t * @param {*} x\n\t\t * @returns {boolean} true iff x is a trusted Promise\n\t\t */\n\t\tfunction isPromise(x) {\n\t\t\treturn x instanceof Promise;\n\t\t}\n\n\t\t/**\n\t\t * Test just enough to rule out primitives, in order to take faster\n\t\t * paths in some code\n\t\t * @param {*} x\n\t\t * @returns {boolean} false iff x is guaranteed *not* to be a thenable\n\t\t */\n\t\tfunction maybeThenable(x) {\n\t\t\treturn (typeof x === \'object\' || typeof x === \'function\') && x !== null;\n\t\t}\n\n\t\tfunction runContinuation1(f, h, receiver, next) {\n\t\t\tif(typeof f !== \'function\') {\n\t\t\t\treturn next.become(h);\n\t\t\t}\n\n\t\t\tPromise.enterContext(h);\n\t\t\ttryCatchReject(f, h.value, receiver, next);\n\t\t\tPromise.exitContext();\n\t\t}\n\n\t\tfunction runContinuation3(f, x, h, receiver, next) {\n\t\t\tif(typeof f !== \'function\') {\n\t\t\t\treturn next.become(h);\n\t\t\t}\n\n\t\t\tPromise.enterContext(h);\n\t\t\ttryCatchReject3(f, x, h.value, receiver, next);\n\t\t\tPromise.exitContext();\n\t\t}\n\n\t\t/**\n\t\t * @deprecated\n\t\t */\n\t\tfunction runNotify(f, x, h, receiver, next) {\n\t\t\tif(typeof f !== \'function\') {\n\t\t\t\treturn next.notify(x);\n\t\t\t}\n\n\t\t\tPromise.enterContext(h);\n\t\t\ttryCatchReturn(f, x, receiver, next);\n\t\t\tPromise.exitContext();\n\t\t}\n\n\t\tfunction tryCatch2(f, a, b) {\n\t\t\ttry {\n\t\t\t\treturn f(a, b);\n\t\t\t} catch(e) {\n\t\t\t\treturn reject(e);\n\t\t\t}\n\t\t}\n\n\t\t/**\n\t\t * Return f.call(thisArg, x), or if it throws return a rejected promise for\n\t\t * the thrown exception\n\t\t */\n\t\tfunction tryCatchReject(f, x, thisArg, next) {\n\t\t\ttry {\n\t\t\t\tnext.become(getHandler(f.call(thisArg, x)));\n\t\t\t} catch(e) {\n\t\t\t\tnext.become(new Rejected(e));\n\t\t\t}\n\t\t}\n\n\t\t/**\n\t\t * Same as above, but includes the extra argument parameter.\n\t\t */\n\t\tfunction tryCatchReject3(f, x, y, thisArg, next) {\n\t\t\ttry {\n\t\t\t\tf.call(thisArg, x, y, next);\n\t\t\t} catch(e) {\n\t\t\t\tnext.become(new Rejected(e));\n\t\t\t}\n\t\t}\n\n\t\t/**\n\t\t * @deprecated\n\t\t * Return f.call(thisArg, x), or if it throws, *return* the exception\n\t\t */\n\t\tfunction tryCatchReturn(f, x, thisArg, next) {\n\t\t\ttry {\n\t\t\t\tnext.notify(f.call(thisArg, x));\n\t\t\t} catch(e) {\n\t\t\t\tnext.notify(e);\n\t\t\t}\n\t\t}\n\n\t\tfunction inherit(Parent, Child) {\n\t\t\tChild.prototype = objectCreate(Parent.prototype);\n\t\t\tChild.prototype.constructor = Child;\n\t\t}\n\n\t\tfunction snd(x, y) {\n\t\t\treturn y;\n\t\t}\n\n\t\tfunction noop() {}\n\n\t\tfunction initEmitRejection() {\n\t\t\t/*global process, self, CustomEvent*/\n\t\t\tif(typeof process !== \'undefined\' && process !== null\n\t\t\t\t&& typeof process.emit === \'function\') {\n\t\t\t\t// Returning falsy here means to call the default\n\t\t\t\t// onPotentiallyUnhandledRejection API.  This is safe even in\n\t\t\t\t// browserify since process.emit always returns falsy in browserify:\n\t\t\t\t// https://github.com/defunctzombie/node-process/blob/master/browser.js#L40-L46\n\t\t\t\treturn function(type, rejection) {\n\t\t\t\t\treturn type === \'unhandledRejection\'\n\t\t\t\t\t\t? process.emit(type, rejection.value, rejection)\n\t\t\t\t\t\t: process.emit(type, rejection);\n\t\t\t\t};\n\t\t\t} else if(typeof self !== \'undefined\' && typeof CustomEvent === \'function\') {\n\t\t\t\treturn (function(noop, self, CustomEvent) {\n\t\t\t\t\tvar hasCustomEvent = false;\n\t\t\t\t\ttry {\n\t\t\t\t\t\tvar ev = new CustomEvent(\'unhandledRejection\');\n\t\t\t\t\t\thasCustomEvent = ev instanceof CustomEvent;\n\t\t\t\t\t} catch (e) {}\n\n\t\t\t\t\treturn !hasCustomEvent ? noop : function(type, rejection) {\n\t\t\t\t\t\tvar ev = new CustomEvent(type, {\n\t\t\t\t\t\t\tdetail: {\n\t\t\t\t\t\t\t\treason: rejection.value,\n\t\t\t\t\t\t\t\tkey: rejection\n\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\tbubbles: false,\n\t\t\t\t\t\t\tcancelable: true\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\treturn !self.dispatchEvent(ev);\n\t\t\t\t\t};\n\t\t\t\t}(noop, self, CustomEvent));\n\t\t\t}\n\n\t\t\treturn noop;\n\t\t}\n\n\t\treturn Promise;\n\t};\n});\n}(typeof define === \'function\' && define.amd ? define : function(factory) { module.exports = factory(); }));\n\n},{}]},{},[1])\n//# sourceMappingURL=Promise.js.map\n(1)\n});\n;';
    loader.global.define = undefined;
    loader.global.module = undefined;
    loader.global.exports = undefined;
    loader.__exec({
        'source': source,
        'address': module.uri
    });
    loader.global.require = require;
    loader.global.define = define;
    return loader.get('@@global-helpers').retrieveGlobal(module.id, undefined);
});
/*can-connect@0.6.0-pre.4#helpers/sorted-set-json*/
define('fixture-can-connect/helpers/sorted-set-json', function (require, exports, module) {
    var forEach = [].forEach;
    var keys = Object.keys;
    module.exports = function (set) {
        if (set == null) {
            return set;
        } else {
            var sorted = {};
            forEach.call(keys(set).sort(), function (prop) {
                sorted[prop] = set[prop];
            });
            return JSON.stringify(sorted);
        }
    };
});
/*can-connect@0.6.0-pre.4#helpers/overwrite*/
define('fixture-can-connect/helpers/overwrite', function (require, exports, module) {
    module.exports = function (d, s, id) {
        for (var prop in d) {
            if (prop !== id && !(prop in s)) {
                delete d[prop];
            }
        }
        for (prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-connect@0.6.0-pre.4#helpers/set-add*/
define('fixture-can-connect/helpers/set-add', function (require, exports, module) {
    var canSet = require('fixture-can-set/src/set');
    module.exports = function (connection, setItems, items, item, algebra) {
        var index = canSet.index(setItems, items, item, algebra);
        if (index === undefined) {
            index = items.length;
        }
        var copy = items.slice(0);
        copy.splice(index, 0, item);
        return copy;
    };
});
/*can-connect@0.6.0-pre.4#helpers/get-index-by-id*/
define('fixture-can-connect/helpers/get-index-by-id', function (require, exports, module) {
    module.exports = function (connection, props, items) {
        var id = connection.id(props);
        for (var i = 0; i < items.length; i++) {
            var connId = connection.id(items[i]);
            if (id == connId) {
                return i;
            }
        }
        return -1;
    };
});
/*can-connect@0.6.0-pre.4#data/memory-cache/memory-cache*/
define('fixture-can-connect/data/memory-cache/memory-cache', function (require, exports, module) {
    var getItems = require('fixture-can-connect/helpers/get-items');
    require('when/es6-shim/Promise');
    var connect = require('fixture-can-connect/can-connect');
    var sortedSetJSON = require('fixture-can-connect/helpers/sorted-set-json');
    var canSet = require('fixture-can-set/src/set');
    var overwrite = require('fixture-can-connect/helpers/overwrite');
    var setAdd = require('fixture-can-connect/helpers/set-add');
    var indexOf = require('fixture-can-connect/helpers/get-index-by-id');
    var assign = require('can-util/js/assign/assign');
    module.exports = connect.behavior('data-memory-cache', function (baseConnect) {
        var behavior = {
            _sets: {},
            getSetData: function () {
                return this._sets;
            },
            __getListData: function (set) {
                var setsData = this.getSetData();
                var setData = setsData[sortedSetJSON(set)];
                if (setData) {
                    return setData.items;
                }
            },
            _instances: {},
            getInstance: function (id) {
                return this._instances[id];
            },
            removeSet: function (setKey, noUpdate) {
                var sets = this.getSetData();
                delete sets[setKey];
                if (noUpdate !== true) {
                    this.updateSets();
                }
            },
            updateSets: function () {
            },
            updateInstance: function (props) {
                var id = this.id(props);
                if (!(id in this._instances)) {
                    this._instances[id] = props;
                } else {
                    overwrite(this._instances[id], props, this.idProp);
                }
                return this._instances[id];
            },
            updateSet: function (setDatum, items, newSet) {
                var newSetKey = newSet ? sortedSetJSON(newSet) : setDatum.setKey;
                if (newSet) {
                    if (newSetKey !== setDatum.setKey) {
                        var sets = this.getSetData();
                        var oldSetKey = setDatum.setKey;
                        sets[newSetKey] = setDatum;
                        setDatum.setKey = newSetKey;
                        setDatum.set = assign({}, newSet);
                        this.removeSet(oldSetKey);
                    }
                }
                setDatum.items = items;
                var self = this;
                items.forEach(function (item) {
                    self.updateInstance(item);
                });
            },
            addSet: function (set, data) {
                var items = getItems(data);
                var sets = this.getSetData();
                var setKey = sortedSetJSON(set);
                sets[setKey] = {
                    setKey: setKey,
                    items: items,
                    set: assign({}, set)
                };
                var self = this;
                items.forEach(function (item) {
                    self.updateInstance(item);
                });
                this.updateSets();
            },
            _eachSet: function (cb) {
                var sets = this.getSetData();
                var self = this;
                var loop = function (setDatum, setKey) {
                    return cb.call(self, setDatum, setKey, function () {
                        return setDatum.items;
                    });
                };
                for (var setKey in sets) {
                    var setDatum = sets[setKey];
                    var result = loop(setDatum, setKey);
                    if (result !== undefined) {
                        return result;
                    }
                }
            },
            _getSets: function () {
                var sets = [], setsData = this.getSetData();
                for (var prop in setsData) {
                    sets.push(setsData[prop].set);
                }
                return sets;
            },
            getSets: function () {
                return Promise.resolve(this._getSets());
            },
            clear: function () {
                this._instances = {};
                this._sets = {};
            },
            getListData: function (set) {
                var listData = this._getListData(set);
                if (listData) {
                    return Promise.resolve(listData);
                }
                return Promise.reject({
                    message: 'no data',
                    error: 404
                });
            },
            _getListData: function (set) {
                var sets = this._getSets();
                for (var i = 0; i < sets.length; i++) {
                    var checkSet = sets[i];
                    if (canSet.subset(set, checkSet, this.algebra)) {
                        var items = canSet.getSubset(set, checkSet, this.__getListData(checkSet), this.algebra);
                        return { data: items };
                    }
                }
            },
            updateListData: function (data, set) {
                var items = getItems(data);
                var sets = this.getSetData();
                var self = this;
                for (var setKey in sets) {
                    var setDatum = sets[setKey];
                    var union = canSet.union(setDatum.set, set, this.algebra);
                    if (union) {
                        var getSet = assign({}, setDatum.set);
                        return this.getListData(getSet).then(function (setData) {
                            self.updateSet(setDatum, canSet.getUnion(getSet, set, getItems(setData), items, self.algebra), union);
                        });
                    }
                }
                this.addSet(set, data);
                return Promise.resolve();
            },
            getData: function (params) {
                var id = this.id(params);
                var res = this.getInstance(id);
                if (res) {
                    return Promise.resolve(res);
                } else {
                    return Promise.reject({
                        message: 'no data',
                        error: 404
                    });
                }
            },
            createData: function (props) {
                var self = this;
                var instance = this.updateInstance(props);
                this._eachSet(function (setDatum, setKey, getItems) {
                    if (canSet.has(setDatum.set, instance, this.algebra)) {
                        self.updateSet(setDatum, setAdd(self, setDatum.set, getItems(), instance, self.algebra), setDatum.set);
                    }
                });
                return Promise.resolve(assign({}, instance));
            },
            updateData: function (props) {
                var self = this;
                var instance = this.updateInstance(props);
                this._eachSet(function (setDatum, setKey, getItems) {
                    var items = getItems();
                    var index = indexOf(self, instance, items);
                    if (canSet.subset(instance, setDatum.set, this.algebra)) {
                        if (index === -1) {
                            self.updateSet(setDatum, setAdd(self, setDatum.set, getItems(), instance, self.algebra));
                        } else {
                            items.splice(index, 1, instance);
                            self.updateSet(setDatum, items);
                        }
                    } else if (index !== -1) {
                        items.splice(index, 1);
                        self.updateSet(setDatum, items);
                    }
                });
                return Promise.resolve(assign({}, instance));
            },
            destroyData: function (props) {
                var self = this;
                this._eachSet(function (setDatum, setKey, getItems) {
                    var items = getItems();
                    var index = indexOf(self, props, items);
                    if (index !== -1) {
                        items.splice(index, 1);
                        self.updateSet(setDatum, items);
                    }
                });
                var id = this.id(props);
                delete this._instances[id];
                return Promise.resolve(assign({}, props));
            }
        };
        return behavior;
    });
});
/*store*/
define('can-fixture/store', function (require, exports, module) {
    var canSet = require('fixture-can-set/src/set');
    var connect = require('fixture-can-connect/can-connect');
    var legacyStore = require('can-fixture/helpers/legacyStore');
    var each = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    require('fixture-can-connect/data/memory-cache/memory-cache');
    var firstProp = function (obj) {
        for (var prop in obj) {
            return prop;
        }
    };
    var connectToConnection = function (method) {
        return function (req, res) {
            this.connection[method](req.data).then(function (data) {
                res(data);
            }, function (err) {
                res(403, err);
            });
        };
    };
    var makeMakeItems = function (baseItems, idProp) {
        return function () {
            var items = [], maxId = 0;
            each(baseItems, function (item) {
                items.push(JSON.parse(JSON.stringify(item)));
                maxId = Math.max(item[idProp] + 1, maxId + 1) || items.length;
            });
            return {
                maxId: maxId,
                items: items
            };
        };
    };
    var Store = function (connection, makeItems, idProp) {
        this.connection = connection;
        this.makeItems = makeItems;
        this.idProp = idProp;
        this.reset();
        for (var method in Store.prototype) {
            this[method] = this[method].bind(this);
        }
    };
    assign(Store.prototype, {
        getListData: connectToConnection('getListData'),
        getData: connectToConnection('getData'),
        createData: function (req, res) {
            var idProp = this.idProp;
            req.data[idProp] = ++this.maxId;
            this.connection.createData(req.data).then(function (data) {
                var responseData = {};
                responseData[idProp] = req.data[idProp];
                res(responseData);
            }, function (err) {
                res(403, err);
            });
        },
        updateData: connectToConnection('updateData'),
        destroyData: connectToConnection('destroyData'),
        reset: function (newItems) {
            if (newItems) {
                this.makeItems = makeMakeItems(newItems, this.idProp);
            }
            var itemData = this.makeItems();
            this.maxId = itemData.maxId;
            this.connection.addSet({}, { data: itemData.items });
        },
        get: function (params) {
            var id = this.connection.id(params);
            return this.connection.getInstance(id);
        },
        getList: function (set) {
            return this.connection._getListData(set);
        }
    });
    each({
        findAll: 'getListData',
        findOne: 'getData',
        create: 'createData',
        update: 'updateData',
        destroy: 'destroyData'
    }, function (method, prop) {
        Store.prototype[prop] = function () {
            return this[method].apply(this, arguments);
        };
    });
    Store.make = function (count, make, algebra) {
        var isNew = false;
        if (count instanceof canSet.Algebra || make instanceof canSet.Algebra || algebra instanceof canSet.Algebra) {
            isNew = true;
        }
        if (!isNew) {
            return legacyStore.apply(this, arguments);
        }
        var makeItems, idProp;
        if (typeof count === 'number') {
            idProp = firstProp(algebra.clauses.id || {}) || 'id';
            makeItems = function () {
                var items = [];
                var maxId = 0;
                for (var i = 0; i < count; i++) {
                    var item = make(i, items);
                    if (!item[idProp]) {
                        item[idProp] = i;
                    }
                    maxId = Math.max(item[idProp] + 1, maxId + 1) || items.length;
                    items.push(item);
                }
                return {
                    maxId: maxId,
                    items: items
                };
            };
        } else if (isArrayLike(count)) {
            algebra = make;
            idProp = firstProp(algebra.clauses.id || {}) || 'id';
            makeItems = makeMakeItems(count, idProp);
        }
        var connection = connect(['data-memory-cache'], {
            algebra: algebra,
            idProp: idProp
        });
        return new Store(connection, makeItems, idProp);
    };
    module.exports = Store;
});
/*core*/
define('can-fixture/core', function (require, exports, module) {
    var canSet = require('fixture-can-set/src/set');
    var sub = require('can-util/js/string/string').sub;
    var each = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    require('can-fixture/store');
    var fixtures = [];
    exports.fixtures = fixtures;
    exports.add = function (settings, fixture) {
        if (fixture && (fixture.getData || fixture.getListData)) {
            var root = settings, store = fixture, idProp = store.idProp;
            fixture = undefined;
            settings = {};
            settings['GET ' + root] = store.getData;
            settings['DELETE ' + root] = store.destroyData;
            settings['PUT ' + root] = store.updateData;
            var getListUrl = root.replace(new RegExp('\\/\\{' + idProp + '\\}.*'), '');
            settings['GET ' + getListUrl] = store.getListData;
            settings['POST ' + getListUrl] = store.createData;
        }
        if (fixture !== undefined) {
            if (typeof settings === 'string') {
                var matches = settings.match(/(GET|POST|PUT|DELETE|PATCH) (.+)/i);
                if (!matches) {
                    settings = { url: settings };
                } else {
                    settings = {
                        url: matches[2],
                        type: matches[1]
                    };
                }
            }
            var index = exports.index(settings, true);
            if (index > -1) {
                fixtures.splice(index, 1);
            }
            if (fixture == null) {
                return;
            }
            if (typeof fixture === 'object') {
                var data = fixture;
                fixture = function () {
                    return data;
                };
            }
            settings.fixture = fixture;
            fixtures.unshift(settings);
        } else {
            each(settings, function (fixture, url) {
                exports.add(url, fixture);
            });
        }
    };
    var $fixture = exports.add;
    $fixture.on = true;
    $fixture.delay = 10;
    exports.callDynamicFixture = function (xhrSettings, fixtureSettings, cb) {
        xhrSettings.data = fixtureSettings.data;
        var response = function () {
            var res = exports.extractResponse.apply(xhrSettings, arguments);
            return cb.apply(this, res);
        };
        var callFixture = function () {
            var result = fixtureSettings.fixture(xhrSettings, response, xhrSettings.headers, fixtureSettings);
            if (result !== undefined) {
                response(200, result);
            }
        };
        if (!xhrSettings.async) {
            callFixture();
        } else {
            setTimeout(callFixture, $fixture.delay);
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
    exports.get = function (xhrSettings) {
        if (!$fixture.on) {
            return;
        }
        var index = exports.index(xhrSettings, true);
        if (index === -1) {
            index = exports.index(xhrSettings, false);
        }
        var fixtureSettings = index >= 0 ? assign({}, fixtures[index]) : undefined;
        if (fixtureSettings) {
            var url = fixtureSettings.fixture, data = exports.dataFromUrl(fixtureSettings.url, xhrSettings.url);
            if (typeof fixtureSettings.fixture === 'string') {
                if (data) {
                    url = sub(url, data);
                }
                fixtureSettings.url = url;
                fixtureSettings.data = null;
                fixtureSettings.type = 'GET';
                if (!fixtureSettings.error) {
                    fixtureSettings.error = function (xhr, error, message) {
                        throw 'fixtures.js Error ' + error + ' ' + message;
                    };
                }
            } else {
                var xhrData = assign({}, xhrSettings.data || {});
                fixtureSettings.data = assign(xhrData, data);
            }
        }
        return fixtureSettings;
    };
    exports.matches = function (settings, fixture, exact) {
        if (exact) {
            return canSet.equal(settings, fixture, {
                fixture: function () {
                    return true;
                }
            });
        } else {
            return canSet.subset(settings, fixture, exports.defaultCompare);
        }
    };
    var isEmptyOrNull = function (a, b) {
        if (a == null && isEmptyObject(b)) {
            return true;
        } else if (b == null && isEmptyObject(a)) {
            return true;
        } else {
            return canSet.equal(a, b);
        }
    };
    exports.defaultCompare = {
        url: function (a, b) {
            return !!exports.dataFromUrl(b, a);
        },
        fixture: function () {
            return true;
        },
        type: function (a, b) {
            return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
        },
        helpers: function () {
            return true;
        },
        headers: isEmptyOrNull,
        data: isEmptyOrNull
    };
    var replacer = /\{([^\}]+)\}/g;
    exports.dataFromUrl = function (fixtureUrl, url) {
        var order = [], fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.').replace('?', '\\?'), res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
                order.push(part);
                return '([^/]+)';
            }) + '$').exec(url), data = {};
        if (!res) {
            return null;
        }
        res.shift();
        each(order, function (name) {
            data[name] = res.shift();
        });
        return data;
    };
    exports.extractResponse = function (status, response, headers, statusText) {
        if (typeof status !== 'number') {
            headers = response;
            response = status;
            status = 200;
        }
        if (typeof headers === 'string') {
            statusText = headers;
            headers = {};
        }
        return [
            status,
            response,
            headers,
            statusText
        ];
    };
    exports.log = function () {
    };
});
/*helpers/deparam*/
define('can-fixture/helpers/deparam', function (require, exports, module) {
    var each = require('can-util/js/each/each');
    var digitTest = /^\d+$/, keyBreaker = /([^\[\]]+)|(\[\])/g, paramTest = /([^?#]*)(#.*)?$/, prep = function (str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        };
    module.exports = function (params) {
        var data = {}, pairs, lastPart;
        if (params && paramTest.test(params)) {
            pairs = params.split('&');
            each(pairs, function (pair) {
                var parts = pair.split('='), key = prep(parts.shift()), value = prep(parts.join('=')), current = data;
                if (key) {
                    parts = key.match(keyBreaker);
                    for (var j = 0, l = parts.length - 1; j < l; j++) {
                        if (!current[parts[j]]) {
                            current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] === '[]' ? [] : {};
                        }
                        current = current[parts[j]];
                    }
                    lastPart = parts.pop();
                    if (lastPart === '[]') {
                        current.push(value);
                    } else {
                        current[lastPart] = value;
                    }
                }
            });
        }
        return data;
    };
});
/*xhr*/
define('can-fixture/xhr', function (require, exports, module) {
    var fixtureCore = require('can-fixture/core');
    var deparam = require('can-fixture/helpers/deparam');
    var each = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    var XHR = XMLHttpRequest, GLOBAL = typeof global !== 'undefined' ? global : window;
    var events = [
        'abort',
        'error',
        'load',
        'loadend',
        'loadstart',
        'progress'
    ];
    (function () {
        var x = new XHR();
        for (var prop in x) {
            if (prop.indexOf('on') === 0 && events.indexOf(prop.substr(2)) === -1 && prop !== 'onreadystatechange') {
                events.push(prop.substr(2));
            }
        }
    }());
    function callEvents(xhr, ev) {
        var evs = xhr.__events[ev] || [], fn;
        for (var i = 0, len = evs.length; i < len; i++) {
            fn = evs[i];
            fn.call(xhr);
        }
    }
    var assign = function (dest, source, excluding) {
        excluding = excluding || {};
        for (var prop in source) {
            if (!(prop in XMLHttpRequest.prototype) && !excluding[prop]) {
                dest[prop] = source[prop];
            }
        }
    };
    var propsToIgnore = {
        onreadystatechange: true,
        onload: true,
        __events: true
    };
    each(events, function (prop) {
        propsToIgnore['on' + prop] = true;
    });
    var makeXHR = function (mockXHR) {
        var xhr = new XHR();
        assign(xhr, mockXHR, propsToIgnore);
        xhr.onreadystatechange = function (ev) {
            if (xhr.responseType === '' || xhr.responseType === 'text') {
                delete propsToIgnore.responseText;
                delete propsToIgnore.responseXML;
            } else {
                propsToIgnore.responseText = true;
                propsToIgnore.responseXML = true;
            }
            assign(mockXHR, xhr, propsToIgnore);
            if (mockXHR.onreadystatechange) {
                mockXHR.onreadystatechange(ev);
            }
        };
        each(events, function (eventName) {
            xhr['on' + eventName] = function () {
                callEvents(mockXHR, eventName);
                if (mockXHR['on' + eventName]) {
                    return mockXHR['on' + eventName].apply(mockXHR, arguments);
                }
            };
        });
        if (xhr.getResponseHeader) {
            mockXHR.getResponseHeader = function () {
                return xhr.getResponseHeader.apply(xhr, arguments);
            };
        }
        if (mockXHR._disableHeaderCheck && xhr.setDisableHeaderCheck) {
            xhr.setDisableHeaderCheck(true);
        }
        return xhr;
    };
    GLOBAL.XMLHttpRequest = function () {
        var headers = this._headers = {};
        this._xhr = {
            getAllResponseHeaders: function () {
                return headers;
            }
        };
        this.__events = {};
        this.onload = null;
        this.onerror = null;
    };
    assign(XMLHttpRequest.prototype, {
        setRequestHeader: function (name, value) {
            this._headers[name] = value;
        },
        open: function (type, url, async) {
            this.type = type;
            this.url = url;
            this.async = async === false ? false : true;
        },
        getAllResponseHeaders: function () {
            return this._xhr.getAllResponseHeaders.apply(this._xhr, arguments);
        },
        addEventListener: function (ev, fn) {
            var evs = this.__events[ev] = this.__events[ev] || [];
            evs.push(fn);
        },
        removeEventListener: function (ev, fn) {
            var evs = this.__events[ev] = this.__events[ev] || [];
            var idx = evs.indexOf(fn);
            if (idx >= 0) {
                evs.splice(idx, 1);
            }
        },
        setDisableHeaderCheck: function (val) {
            this._disableHeaderCheck = !!val;
        },
        getResponseHeader: function (key) {
            return '';
        },
        send: function (data) {
            var xhrSettings = {
                url: this.url,
                data: data,
                headers: this._headers,
                type: this.type.toLowerCase() || 'get',
                async: this.async
            };
            if (!xhrSettings.data && xhrSettings.type === 'get' || xhrSettings.type === 'delete') {
                xhrSettings.data = deparam(xhrSettings.url.split('?')[1]);
                xhrSettings.url = xhrSettings.url.split('?')[0];
            }
            if (typeof xhrSettings.data === 'string') {
                try {
                    xhrSettings.data = JSON.parse(xhrSettings.data);
                } catch (e) {
                    xhrSettings.data = deparam(xhrSettings.data);
                }
            }
            var fixtureSettings = fixtureCore.get(xhrSettings);
            var mockXHR = this;
            if (fixtureSettings && typeof fixtureSettings.fixture === 'function') {
                return fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function (status, body, headers, statusText) {
                    body = typeof body === 'string' ? body : JSON.stringify(body);
                    assign(mockXHR, {
                        readyState: 4,
                        status: status
                    });
                    var success = status >= 200 && status < 300 || status === 304;
                    if (success) {
                        assign(mockXHR, {
                            statusText: statusText || 'OK',
                            responseText: body
                        });
                    } else {
                        assign(mockXHR, {
                            statusText: statusText || 'error',
                            responseText: body
                        });
                    }
                    if (mockXHR.onreadystatechange) {
                        mockXHR.onreadystatechange({ target: mockXHR });
                    }
                    callEvents(mockXHR, 'progress');
                    if (mockXHR.onprogress) {
                        mockXHR.onprogress();
                    }
                    callEvents(mockXHR, 'load');
                    if (mockXHR.onload) {
                        mockXHR.onload();
                    }
                    callEvents(mockXHR, 'loadend');
                    if (mockXHR.onloadend) {
                        mockXHR.onloadend();
                    }
                });
            }
            var xhr = makeXHR(this), makeRequest = function () {
                    mockXHR._xhr = xhr;
                    xhr.open(xhr.type, xhr.url, xhr.async);
                    if (mockXHR._headers) {
                        Object.keys(mockXHR._headers).forEach(function (key) {
                            xhr.setRequestHeader(key, mockXHR._headers[key]);
                        });
                    }
                    return xhr.send(data);
                };
            if (fixtureSettings && typeof fixtureSettings.fixture === 'number') {
                setTimeout(makeRequest, fixtureSettings.fixture);
                return;
            }
            if (fixtureSettings) {
                assign(xhr, fixtureSettings);
            }
            return makeRequest();
        }
    });
});
/*fixture*/
define('can-fixture', function (require, exports, module) {
    var core = require('can-fixture/core');
    var fixture = core.add;
    var Store = require('can-fixture/store');
    require('can-fixture/xhr');
    var assign = require('can-util/js/assign/assign');
    var noop = function () {
    };
    assign(fixture, {
        rand: function randomize(arr, min, max) {
            if (typeof arr === 'number') {
                if (typeof min === 'number') {
                    return arr + Math.floor(Math.random() * (min - arr + 1));
                } else {
                    return Math.floor(Math.random() * (arr + 1));
                }
            }
            var choices = arr.slice(0);
            if (min === undefined) {
                min = 1;
                max = choices.length;
            } else if (max === undefined) {
                max = min;
            }
            var result = [];
            var selectedCount = min + Math.round(randomize(max - min));
            for (var i = 0; i < selectedCount; i++) {
                var selectedIndex = randomize(choices.length - 1), selected = choices.splice(selectedIndex, 1)[0];
                result.push(selected);
            }
            return result;
        },
        xhr: function (xhr) {
            return assign({}, {
                abort: noop,
                getAllResponseHeaders: function () {
                    return '';
                },
                getResponseHeader: function () {
                    return '';
                },
                open: noop,
                overrideMimeType: noop,
                readyState: 4,
                responseText: '',
                responseXML: null,
                send: noop,
                setRequestHeader: noop,
                status: 200,
                statusText: 'OK'
            }, xhr);
        },
        store: Store.make,
        fixtures: core.fixtures
    });
    if (typeof window !== 'undefined' && !require.resolve) {
        window.fixture = fixture;
    }
    module.exports = fixture;
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();