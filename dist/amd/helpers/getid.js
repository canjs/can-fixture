/*can-fixture@1.0.13#helpers/getid*/
define(function (require, exports, module) {
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