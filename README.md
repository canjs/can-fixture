# can-fixture


`can-fixture` intercepts an AJAX request and simulates
the response with a file or function. Use `can-fixture` to:

- Develop JavaScript independently of the backend services.
- Test code that makes AJAX requests without needing a server.
- Simulate slow responses or difficult to reproduce error conditions.

`can-fixture` is self contained and can be used without the rest of CanJS.

## Install

If you are using `Browserify` or [StealJS](http://stealjs.com), install it with NPM:

```
npm install can-fixture --save-dev
```

Then `import`, `require`, `steal`, or `define` the `"can-fixture"` module:

```
var fixture = require("can-fixture");
```

## Use


