var helpers = {
	extend: function(d, s){
		for(var prop in s) {
			d[prop] = s[prop]
		}
		return d;
	},
	isArrayLike: function(obj){
		return obj && typeof obj.length === "number" && obj.length >= 0
	},
	each: function(obj, cb){
		if(helpers.isArrayLike(obj)) {
			for(var i = 0 ; i < obj.length; i++) {
				cb(obj[i], i);
			}
		} else {
			for(var prop in obj) {
				cb(obj[prop], prop);
			}
		}
		return obj;
	},
	isEmptyObject: function(obj){
		for(var prop in obj) {
			return false;
		}
		return true;
	},
	firstProp: function(obj){
		for(var prop in obj) {
			return prop;
		}
	}
}
module.exports = helpers;
