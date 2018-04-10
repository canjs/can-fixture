var QUnit = require('steal-qunit');
var matches = require("../matches");


QUnit.test('core.defaultCompare', function () {
	
	var same = matches.request({
        url: '/thingers/5'
	}, {
		url: '/thingers/{id}'
	});
	ok(same, 'they are similar');

	same = matches.request({
		url: '/thingers/5'
	}, {
		url: '/thingers'
	});
	ok(!same, 'they are not the same');
});

QUnit.test('core.matches', function () {
	var same = matches.matches({
		url: '/thingers/5'
	}, {
		url: '/thingers/{id}'
	});

	ok(same, 'similar');
	same = matches.matches({
		url: '/thingers/5',
		type: 'get'
	}, {
		url: '/thingers/{id}'
	});
	ok(same, 'similar with extra pops on settings');
	var exact = matches.matches({
		url: '/thingers/5',
		type: 'get'
	}, {
		url: '/thingers/{id}'
	}, true);
	ok(!exact, 'not exact');
	exact = matches.matches({
		url: '/thingers/5'
	}, {
		url: '/thingers/5'
	}, true);
	ok(exact, 'exact');
});
