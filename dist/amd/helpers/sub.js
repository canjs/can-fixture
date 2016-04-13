/*helpers/sub*/
define(function (require, exports, module) {
    var strReplacer = /\{([^\}]+)\}/g;
    var getObject = function (prop, data, remove) {
        var res = data[prop];
        if (remove) {
            delete data[prop];
        }
        return res;
    };
    var isContainer = function (current) {
        return typeof current === 'object' || typeof current === 'object';
    };
    module.exports = function (str, data, remove) {
        var obs = [];
        str = str || '';
        obs.push(str.replace(strReplacer, function (whole, inside) {
            var ob = getObject(inside, data, remove);
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
    };
});