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
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
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
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
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
/*can-util@3.3.2#js/assign/assign*/
define('can-util/js/assign/assign', function (require, exports, module) {
    module.exports = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-util@3.3.2#js/is-array-like/is-array-like*/
define('can-util/js/is-array-like/is-array-like', function (require, exports, module) {
    function isArrayLike(obj) {
        var type = typeof obj;
        if (type === 'string') {
            return true;
        }
        var length = obj && type !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof obj !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    }
    module.exports = isArrayLike;
});
/*can-namespace@1.0.0#can-namespace*/
define('can-namespace', function (require, exports, module) {
    module.exports = {};
});
/*can-types@1.0.3#can-types*/
define('can-types', function (require, exports, module) {
    var namespace = require('can-namespace');
    var types = {
        isMapLike: function () {
            return false;
        },
        isListLike: function () {
            return false;
        },
        isPromise: function (obj) {
            return obj instanceof Promise || Object.prototype.toString.call(obj) === '[object Promise]';
        },
        isConstructor: function (func) {
            if (typeof func !== 'function') {
                return false;
            }
            for (var prop in func.prototype) {
                return true;
            }
            return false;
        },
        isCallableForValue: function (obj) {
            return typeof obj === 'function' && !types.isConstructor(obj);
        },
        isCompute: function (obj) {
            return obj && obj.isComputed;
        },
        iterator: typeof Symbol === 'function' && Symbol.iterator || '@@iterator',
        DefaultMap: null,
        DefaultList: null,
        queueTask: function (task) {
            var args = task[2] || [];
            task[0].apply(task[1], args);
        },
        wrapElement: function (element) {
            return element;
        },
        unwrapElement: function (element) {
            return element;
        }
    };
    if (namespace.types) {
        throw new Error('You can\'t have two versions of can-types, check your dependencies');
    } else {
        module.exports = namespace.types = types;
    }
});
/*can-util@3.3.2#js/is-iterable/is-iterable*/
define('can-util/js/is-iterable/is-iterable', function (require, exports, module) {
    var types = require('can-types');
    module.exports = function (obj) {
        return obj && !!obj[types.iterator];
    };
});
/*can-util@3.3.2#js/each/each*/
define('can-util/js/each/each', function (require, exports, module) {
    var isArrayLike = require('../is-array-like/is-array-like');
    var has = Object.prototype.hasOwnProperty;
    var isIterable = require('../is-iterable/is-iterable');
    var types = require('can-types');
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
            } else if (isIterable(elements)) {
                var iter = elements[types.iterator]();
                var res, value;
                while (!(res = iter.next()).done) {
                    value = res.value;
                    callback.call(context || elements, Array.isArray(value) ? value[1] : value, value[0]);
                }
            } else if (typeof elements === 'object') {
                for (key in elements) {
                    if (has.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                        break;
                    }
                }
            }
        }
        return elements;
    }
    module.exports = each;
});
/*can-util@3.3.2#js/last/last*/
define('can-util/js/last/last', function (require, exports, module) {
    module.exports = function (arr) {
        return arr && arr[arr.length - 1];
    };
});
/*can-set@1.1.0#src/helpers*/
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
/*can-set@1.1.0#src/clause*/
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
/*can-util@3.3.2#js/make-array/make-array*/
define('can-util/js/make-array/make-array', function (require, exports, module) {
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
/*can-set@1.1.0#src/compare*/
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
            if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
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
/*can-set@1.1.0#src/get*/
define('fixture-can-set/src/get', function (require, exports, module) {
    var compare = require('fixture-can-set/src/compare');
    var h = require('fixture-can-set/src/helpers');
    var each = require('can-util/js/each/each');
    var filterData = function (data, clause, props) {
        return h.filter.call(data, function (item) {
            var isSubset = compare.subset(item, clause, undefined, undefined, undefined, props, {});
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
/*can-util@3.3.2#js/is-empty-object/is-empty-object*/
define('can-util/js/is-empty-object/is-empty-object', function (require, exports, module) {
    module.exports = function (obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    };
});
/*can-set@1.1.0#src/set-core*/
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
        count: function (set) {
            return this.evaluateOperator(compare.count, set, {});
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
        },
        id: function (props) {
            var keys = Object.keys(this.clauses.id);
            if (keys.length === 1) {
                return props[keys[0]];
            } else {
                var id = {};
                keys.forEach(function (key) {
                    id[key] = props[key];
                });
                return JSON.stringify(id);
            }
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
/*can-set@1.1.0#src/props*/
define('fixture-can-set/src/props', function (require, exports, module) {
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
    var props = {
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
        paginate: function (propStart, propEnd, translateToStartEnd, reverseTranslate) {
            var compares = {};
            var makeResult = function (result, index) {
                var res = {};
                each([
                    'intersection',
                    'difference',
                    'union'
                ], function (prop) {
                    if (result[prop]) {
                        var set = {
                            start: result[prop][0],
                            end: result[prop][1]
                        };
                        res[prop] = reverseTranslate(set)[index === 0 ? propStart : propEnd];
                    }
                });
                if (result.count) {
                    res.count = result.count;
                }
                return res;
            };
            compares[propStart] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var res = diff(translateToStartEnd(A), translateToStartEnd(B), 'start', 'end');
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
            compares[propEnd] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var data = diff(translateToStartEnd(A), translateToStartEnd(B), 'start', 'end');
                var res = makeResult(data, 1);
                res.getSubset = function (a, b, bItems, algebra, options) {
                    var tA = translateToStartEnd(a);
                    var tB = translateToStartEnd(b);
                    var numProps = numericProperties(tA, tB, 'start', 'end');
                    var aStartValue = numProps.sAv1, aEndValue = numProps.sAv2;
                    var bStartValue = numProps.sBv1;
                    if (!('end' in tB) || !('end' in tA)) {
                        return bItems.slice(aStartValue, aEndValue + 1);
                    }
                    return bItems.slice(aStartValue - bStartValue, aEndValue - bStartValue + 1);
                };
                res.getUnion = function (a, b, aItems, bItems, algebra, options) {
                    var tA = translateToStartEnd(a);
                    var tB = translateToStartEnd(b);
                    if (data.meta.indexOf('after') >= 0) {
                        if (data.intersection) {
                            bItems = bItems.slice(0, data.intersection[0] - +tB.start);
                        }
                        return [
                            bItems,
                            aItems
                        ];
                    }
                    if (data.intersection) {
                        aItems = aItems.slice(0, data.intersection[0] - +tA.start);
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
    var assignExcept = function (d, s, props) {
        for (var prop in s) {
            if (!props[prop]) {
                d[prop] = s[prop];
            }
        }
        return d;
    };
    var translateToOffsetLimit = function (set, offsetProp, limitProp) {
        var newSet = assignExcept({}, set, {
            start: 1,
            end: 1
        });
        if ('start' in set) {
            newSet[offsetProp] = set.start;
        }
        if ('end' in set) {
            newSet[limitProp] = set.end - set.start + 1;
        }
        return newSet;
    };
    var translateToStartEnd = function (set, offsetProp, limitProp) {
        var except = {};
        except[offsetProp] = except[limitProp] = 1;
        var newSet = assignExcept({}, set, except);
        if (offsetProp in set) {
            newSet.start = parseInt(set[offsetProp], 10);
        }
        if (limitProp in set) {
            newSet.end = newSet.start + parseInt(set[limitProp]) - 1;
        }
        return newSet;
    };
    props.offsetLimit = function (offsetProp, limitProp) {
        offsetProp = offsetProp || 'offset';
        limitProp = limitProp || 'limit';
        return props.paginate(offsetProp, limitProp, function (set) {
            return translateToStartEnd(set, offsetProp, limitProp);
        }, function (set) {
            return translateToOffsetLimit(set, offsetProp, limitProp);
        });
    };
    props.rangeInclusive = function (startIndexProperty, endIndexProperty) {
        startIndexProperty = startIndexProperty || 'start';
        endIndexProperty = endIndexProperty || 'end';
        return props.paginate(startIndexProperty, endIndexProperty, function (set) {
            var except = {};
            except[startIndexProperty] = except[endIndexProperty] = 1;
            var newSet = assignExcept({}, set, except);
            if (startIndexProperty in set) {
                newSet.start = set[startIndexProperty];
            }
            if (endIndexProperty in set) {
                newSet.end = set[endIndexProperty];
            }
            return newSet;
        }, function (set) {
            var except = {
                start: 1,
                end: 1
            };
            var newSet = assignExcept({}, set, except);
            newSet[startIndexProperty] = set.start;
            newSet[endIndexProperty] = set.end;
            return newSet;
        });
    };
    module.exports = props;
});
/*can-set@1.1.0#src/set*/
define('fixture-can-set/src/set', function (require, exports, module) {
    var set = require('fixture-can-set/src/set-core');
    var ns = require('can-namespace');
    var props = require('fixture-can-set/src/props');
    var clause = require('fixture-can-set/src/clause');
    set.comparators = props;
    set.props = props;
    set.helpers = require('fixture-can-set/src/helpers');
    set.clause = clause;
    module.exports = ns.set = set;
});
/*can-util@3.3.2#js/is-container/is-container*/
define('can-util/js/is-container/is-container', function (require, exports, module) {
    module.exports = function (current) {
        return /^f|^o/.test(typeof current);
    };
});
/*can-util@3.3.2#js/get/get*/
define('can-util/js/get/get', function (require, exports, module) {
    var isContainer = require('../is-container/is-container');
    function get(obj, name) {
        var parts = typeof name !== 'undefined' ? (name + '').replace(/\[/g, '.').replace(/]/g, '').split('.') : [], length = parts.length, current, i, container;
        if (!length) {
            return obj;
        }
        current = obj;
        for (i = 0; i < length && isContainer(current); i++) {
            container = current;
            current = container[parts[i]];
        }
        return current;
    }
    module.exports = get;
});
/*can-util@3.3.2#js/log/log*/
define('can-util/js/log/log', function (require, exports, module) {
    exports.warnTimeout = 5000;
    exports.logLevel = 0;
    exports.warn = function (out) {
        var ll = this.logLevel;
        if (ll < 2) {
            Array.prototype.unshift.call(arguments, 'WARN:');
            if (typeof console !== 'undefined' && console.warn) {
                this._logger('warn', Array.prototype.slice.call(arguments));
            } else if (typeof console !== 'undefined' && console.log) {
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS WARNING: ' + out);
            }
        }
    };
    exports.log = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.log) {
                Array.prototype.unshift.call(arguments, 'INFO:');
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS INFO: ' + out);
            }
        }
    };
    exports.error = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.error) {
                Array.prototype.unshift.call(arguments, 'ERROR:');
                this._logger('error', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('ERROR: ' + out);
            }
        }
    };
    exports._logger = function (type, arr) {
        try {
            console[type].apply(console, arr);
        } catch (e) {
            console[type](arr);
        }
    };
});
/*can-util@3.3.2#js/dev/dev*/
define('can-util/js/dev/dev', function (require, exports, module) {
    var canLog = require('../log/log');
    module.exports = {
        warnTimeout: 5000,
        logLevel: 0,
        warn: function () {
        },
        log: function () {
        },
        _logger: canLog._logger
    };
});
/*can-util@3.3.2#js/is-array/is-array*/
define('can-util/js/is-array/is-array', function (require, exports, module) {
    module.exports = function (arr) {
        return Array.isArray(arr);
    };
});
/*can-util@3.3.2#js/string/string*/
define('can-util/js/string/string', function (require, exports, module) {
    var get = require('../get/get');
    var isContainer = require('../is-container/is-container');
    var canDev = require('../dev/dev');
    var isArray = require('../is-array/is-array');
    var strUndHash = /_|-/, strColons = /\=\=/, strWords = /([A-Z]+)([A-Z][a-z])/g, strLowUp = /([a-z\d])([A-Z])/g, strDash = /([a-z\d])([A-Z])/g, strReplacer = /\{([^\}]+)\}/g, strQuote = /"/g, strSingleQuote = /'/g, strHyphenMatch = /-+(.)?/g, strCamelMatch = /[a-z][A-Z]/g, convertBadValues = function (content) {
            var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
            return '' + (isInvalid ? '' : content);
        }, deleteAtPath = function (data, path) {
            var parts = path ? path.replace(/\[/g, '.').replace(/]/g, '').split('.') : [];
            var current = data;
            for (var i = 0; i < parts.length - 1; i++) {
                if (current) {
                    current = current[parts[i]];
                }
            }
            if (current) {
                delete current[parts[parts.length - 1]];
            }
        };
    var string = {
        esc: function (content) {
            return convertBadValues(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(strQuote, '&#34;').replace(strSingleQuote, '&#39;');
        },
        getObject: function (name, roots) {
            roots = isArray(roots) ? roots : [roots || window];
            var result, l = roots.length;
            for (var i = 0; i < l; i++) {
                result = get(roots[i], name);
                if (result) {
                    return result;
                }
            }
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
                var ob = get(data, inside);
                if (remove === true) {
                    deleteAtPath(data, inside);
                }
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
/*can-connect@1.3.7#connect*/
define('fixture-can-connect/connect', function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var connect = function (behaviors, options) {
        behaviors = behaviors.map(function (behavior, index) {
            var sortedIndex = -1;
            if (typeof behavior === 'string') {
                sortedIndex = connect.order.indexOf(behavior);
                behavior = behaviorsMap[behavior];
            } else if (behavior.isBehavior) {
                sortedIndex = connect.order.indexOf(behavior.behaviorName);
            } else {
                behavior = connect.behavior(behavior);
            }
            return {
                originalIndex: index,
                sortedIndex: sortedIndex,
                behavior: behavior
            };
        }).sort(function (b1, b2) {
            if (~b1.sortedIndex && ~b2.sortedIndex) {
                return b1.sortedIndex - b2.sortedIndex;
            }
            return b1.originalIndex - b2.originalIndex;
        });
        behaviors = behaviors.map(function (b) {
            return b.behavior;
        });
        var behavior = connect.base(connect.behavior('options', function () {
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
        'data/localstorage-cache',
        'data/url',
        'data/parse',
        'cache-requests',
        'data/combine-requests',
        'constructor',
        'constructor/store',
        'can/map',
        'can/ref',
        'fall-through-cache',
        'data/worker',
        'real-time',
        'data/callbacks-cache',
        'data/callbacks',
        'constructor/callbacks-once'
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
            behaviorMixin.behaviorName = name;
            behaviorsMap[name] = behaviorMixin;
        }
        behaviorMixin.isBehavior = true;
        return behaviorMixin;
    };
    var behaviorsMap = {};
    module.exports = connect;
});
/*can-connect@1.3.7#base/base*/
define('fixture-can-connect/base/base', function (require, exports, module) {
    var connect = require('fixture-can-connect/connect');
    module.exports = connect.behavior('base', function (baseConnection) {
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
            idProp: baseConnection.idProp || 'id',
            listSet: function (list) {
                return list[this.listSetProp];
            },
            listSetProp: '__listSet',
            init: function () {
            }
        };
    });
});
/*can-connect@1.3.7#can-connect*/
define('fixture-can-connect/can-connect', function (require, exports, module) {
    var connect = require('fixture-can-connect/connect');
    var base = require('fixture-can-connect/base/base');
    var ns = require('can-namespace');
    connect.base = base;
    module.exports = ns.connect = connect;
});
/*can-fixture@1.0.12#helpers/getid*/
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
/*can-fixture@1.0.12#helpers/legacyStore*/
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
/*can-connect@1.3.7#helpers/get-items*/
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
/*can-connect@1.3.7#helpers/sorted-set-json*/
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
/*can-connect@1.3.7#helpers/overwrite*/
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
/*can-connect@1.3.7#helpers/set-add*/
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
/*can-connect@1.3.7#helpers/get-index-by-id*/
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
/*can-util@3.3.2#js/is-function/is-function*/
define('can-util/js/is-function/is-function', function (require, exports, module) {
    var isFunction = function () {
        if (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') {
            return function (value) {
                return Object.prototype.toString.call(value) === '[object Function]';
            };
        }
        return function (value) {
            return typeof value === 'function';
        };
    }();
    module.exports = isFunction;
});
/*can-util@3.3.2#js/is-plain-object/is-plain-object*/
define('can-util/js/is-plain-object/is-plain-object', function (require, exports, module) {
    var core_hasOwn = Object.prototype.hasOwnProperty;
    function isWindow(obj) {
        return obj !== null && obj == obj.window;
    }
    function isPlainObject(obj) {
        if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
            return false;
        }
        try {
            if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return key === undefined || core_hasOwn.call(obj, key);
    }
    module.exports = isPlainObject;
});
/*can-util@3.3.2#js/deep-assign/deep-assign*/
define('can-util/js/deep-assign/deep-assign', function (require, exports, module) {
    var isArray = require('../is-array/is-array');
    var isFunction = require('../is-function/is-function');
    var isPlainObject = require('../is-plain-object/is-plain-object');
    function deepAssign() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length;
        if (typeof target !== 'object' && !isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }
                        target[name] = deepAssign(clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }
    module.exports = deepAssign;
});
/*can-connect@1.3.7#helpers/clone-data*/
define('fixture-can-connect/helpers/clone-data', function (require, exports, module) {
    var isArray = require('can-util/js/is-array/is-array');
    var deepAssign = require('can-util/js/deep-assign/deep-assign');
    module.exports = function (data) {
        return isArray(data) ? data.slice(0) : deepAssign({}, data);
    };
});
/*can-connect@1.3.7#data/memory-cache/memory-cache*/
define('fixture-can-connect/data/memory-cache/memory-cache', function (require, exports, module) {
    var getItems = require('fixture-can-connect/helpers/get-items');
    var connect = require('fixture-can-connect/can-connect');
    var sortedSetJSON = require('fixture-can-connect/helpers/sorted-set-json');
    var canSet = require('fixture-can-set/src/set');
    var overwrite = require('fixture-can-connect/helpers/overwrite');
    var setAdd = require('fixture-can-connect/helpers/set-add');
    var indexOf = require('fixture-can-connect/helpers/get-index-by-id');
    var assign = require('can-util/js/assign/assign');
    var cloneData = require('fixture-can-connect/helpers/clone-data');
    module.exports = connect.behavior('data/memory-cache', function (baseConnection) {
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
                set = set || {};
                var listData = this.getListDataSync(set);
                if (listData) {
                    return Promise.resolve(listData);
                }
                return Promise.reject({
                    message: 'no data',
                    error: 404
                });
            },
            getListDataSync: function (set) {
                var sets = this._getSets();
                for (var i = 0; i < sets.length; i++) {
                    var checkSet = sets[i];
                    if (canSet.subset(set, checkSet, this.algebra)) {
                        var source = this.__getListData(checkSet);
                        var items = canSet.getSubset(set, checkSet, source, this.algebra);
                        return {
                            data: items,
                            count: source.length
                        };
                    }
                }
            },
            _getListData: function (set) {
                return this.getListDataSync(set);
            },
            updateListData: function (data, set) {
                set = set || {};
                var clonedData = cloneData(data);
                var items = getItems(clonedData);
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
                this.addSet(set, clonedData);
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
/*can-fixture@1.0.12#store*/
define('can-fixture/store', function (require, exports, module) {
    var canSet = require('fixture-can-set/src/set');
    var connect = require('fixture-can-connect/can-connect');
    var legacyStore = require('can-fixture/helpers/legacyStore');
    var each = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    var dataMemoryCache = require('fixture-can-connect/data/memory-cache/memory-cache');
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
        var connection = connect([dataMemoryCache], {
            algebra: algebra,
            idProp: idProp
        });
        return new Store(connection, makeItems, idProp);
    };
    module.exports = Store;
});
/*can-fixture@1.0.12#core*/
define('can-fixture/core', function (require, exports, module) {
    var canSet = require('fixture-can-set/src/set');
    var sub = require('can-util/js/string/string').sub;
    var each = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var canLog = require('can-util/js/log/log');
    require('can-fixture/store');
    var fixtures = [];
    exports.fixtures = fixtures;
    exports.add = function (settings, fixture) {
        if (fixture && (fixture.getData || fixture.getListData)) {
            var root = settings, store = fixture, idProp = store.idProp, itemRegex = new RegExp('\\/\\{' + idProp + '\\}.*'), rootIsItemUrl = itemRegex.test(root), getListUrl = rootIsItemUrl ? root.replace(itemRegex, '') : root, getItemUrl = rootIsItemUrl ? root : root.trim() + '/{' + idProp + '}';
            fixture = undefined;
            settings = {};
            settings['GET ' + getItemUrl] = store.getData;
            settings['DELETE ' + getItemUrl] = store.destroyData;
            settings['PUT ' + getItemUrl] = store.updateData;
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
    var isEmptyOrSubset = function (a, b) {
        if (a == null && isEmptyObject(b)) {
            return true;
        } else if (b == null && isEmptyObject(a)) {
            return true;
        } else {
            return canSet.subset(a, b);
        }
    };
    exports.defaultCompare = {
        url: function (a, b) {
            return !!exports.dataFromUrl(b, a);
        },
        fixture: function () {
            return true;
        },
        xhr: function () {
            return true;
        },
        type: function (a, b) {
            return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
        },
        method: function (a, b) {
            return b && a ? a.toLowerCase() === b.toLowerCase() : b === a;
        },
        helpers: function () {
            return true;
        },
        headers: isEmptyOrNull,
        data: isEmptyOrSubset
    };
    var replacer = /\{([^\}]+)\}/g;
    exports.dataFromUrl = function (fixtureUrl, url) {
        if (!fixtureUrl) {
            return {};
        }
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
});
/*can-fixture@1.0.12#helpers/deparam*/
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
/*can-fixture@1.0.12#xhr*/
define('can-fixture/xhr', function (require, exports, module) {
    (function (global) {
        var fixtureCore = require('can-fixture/core');
        var deparam = require('can-fixture/helpers/deparam');
        var assign = require('can-util/js/assign/assign');
        var each = require('can-util/js/each/each');
        var canLog = require('can-util/js/log/log');
        var XHR = XMLHttpRequest, GLOBAL = typeof global !== 'undefined' ? global : window;
        var props = [
            'type',
            'url',
            'async',
            'response',
            'responseText',
            'responseType',
            'responseXML',
            'responseURL',
            'status',
            'statusText',
            'readyState'
        ];
        var events = [
            'abort',
            'error',
            'load',
            'loadend',
            'loadstart',
            'progress',
            'readystatechange'
        ];
        (function () {
            var x = new XHR();
            for (var prop in x) {
                if (prop.indexOf('on') === 0) {
                    if (events.indexOf(prop.substr(2)) === -1) {
                        events.push(prop.substr(2));
                    }
                } else if (props.indexOf(prop) === -1 && typeof x[prop] !== 'function') {
                    props.push(prop);
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
        GLOBAL.XMLHttpRequest = function () {
            var mockXHR = this;
            var realXHR = new XHR();
            this._xhr = realXHR;
            this._requestHeaders = {};
            this.__events = {};
            each(events, function (eventName) {
                realXHR['on' + eventName] = function () {
                    callEvents(mockXHR, eventName);
                    if (mockXHR['on' + eventName]) {
                        return mockXHR['on' + eventName].apply(mockXHR, arguments);
                    }
                };
            });
            this.onload = null;
        };
        GLOBAL.XMLHttpRequest._XHR = XHR;
        assign(XMLHttpRequest.prototype, {
            setRequestHeader: function (name, value) {
                this._requestHeaders[name] = value;
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
                return this._xhr.getResponseHeader(key);
            },
            abort: function () {
                var xhr = this._xhr;
                if (this.timeoutId !== undefined) {
                    clearTimeout(this.timeoutId);
                    xhr.open(this.type, this.url, this.async === false ? false : true);
                    xhr.send();
                }
                return xhr.abort();
            },
            send: function (data) {
                var type = this.type.toLowerCase() || 'get';
                var xhrSettings = {
                    url: this.url,
                    data: data,
                    headers: this._requestHeaders,
                    type: type,
                    method: type,
                    async: this.async,
                    xhr: this
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
                    this.timeoutId = fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function (status, body, headers, statusText) {
                        body = typeof body === 'string' ? body : JSON.stringify(body);
                        mockXHR._xhr = {
                            open: function () {
                            },
                            send: function () {
                            },
                            abort: function () {
                            },
                            getResponseHeader: function () {
                            }
                        };
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
                        mockXHR.getAllResponseHeaders = function () {
                            var ret = [];
                            each(headers || {}, function (value, name) {
                                Array.prototype.push.apply(ret, [
                                    name,
                                    ': ',
                                    value,
                                    '\r\n'
                                ]);
                            });
                            return ret.join('');
                        };
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
                    return;
                }
                var makeRequest = function () {
                    mockXHR._xhr.open(mockXHR._xhr.type, mockXHR._xhr.url, mockXHR._xhr.async);
                    if (mockXHR._requestHeaders) {
                        Object.keys(mockXHR._requestHeaders).forEach(function (key) {
                            mockXHR._xhr.setRequestHeader(key, mockXHR._requestHeaders[key]);
                        });
                    }
                    return mockXHR._xhr.send(data);
                };
                if (fixtureSettings && typeof fixtureSettings.fixture === 'number') {
                    canLog.log(xhrSettings.url + ' -> delay ' + fixtureSettings.fixture + 'ms');
                    this.timeoutId = setTimeout(makeRequest, fixtureSettings.fixture);
                    return;
                }
                if (fixtureSettings) {
                    canLog.log(xhrSettings.url + ' -> ' + fixtureSettings.url);
                    assign(mockXHR, fixtureSettings);
                }
                return makeRequest();
            }
        });
        each(props, function (prop) {
            Object.defineProperty(XMLHttpRequest.prototype, prop, {
                get: function () {
                    return this._xhr[prop];
                },
                set: function (newVal) {
                    try {
                        this._xhr[prop] = newVal;
                    } catch (e) {
                    }
                }
            });
        });
    }(function () {
        return this;
    }()));
});
/*can-fixture@1.0.12#fixture*/
define('can-fixture', function (require, exports, module) {
    var core = require('can-fixture/core');
    var fixture = core.add;
    var Store = require('can-fixture/store');
    require('can-fixture/xhr');
    var assign = require('can-util/js/assign/assign');
    var ns = require('can-namespace');
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
    if (typeof window !== 'undefined' && typeof require.resolve !== 'function') {
        window.fixture = fixture;
    }
    module.exports = ns.fixture = fixture;
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();