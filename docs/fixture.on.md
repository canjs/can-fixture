@property {Boolean} can-fixture.on on
@parent can-fixture.properties

@signature `fixture.on`

Turns the fixtures on or off. Defaults to `true` for on.

```js
fixture.on = false; //-> AJAX requests will not be trapped
```

To remove a fixture you can also use `fixture(ajaxSetting, null)`.
