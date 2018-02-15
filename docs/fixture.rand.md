@function can-fixture.rand rand
@parent can-fixture.properties

@signature `fixture.rand(min, max)`

Returns a random integer in the range [min, max]. If only one argument is provided,
returns a random integer from [0, max].

```js
fixture.rand( 1, 10 ); //-> Random number between 1 and 10 inclusive.
fixture.rand( 10 ); //-> Random number between 0 and 10 inclusive.
```
  @param {Number} [min] The lower limit of values that will be returned.
  @param {Number} max The upper limit of values that will be returned.  `max` is valid return value.

@signature `fixture.rand(choices, min, max)`

An array of between min and max random items from choices. If only `min` is
provided, `max` will equal `min`.  If both `max` and `min` are not provided,
`min` will be 1 and `max` will be `choices.length`.

```js
// pick a random number of items from an array
fixture.rand( [ "a", "b", "c" ] ); //-> ["c"]
fixture.rand( [ "a", "b", "c" ] ); //-> ["b","a"]

// pick one item from an array
fixture.rand( [ "a", "b", "c" ], 1 ); //-> ["c"]

// get one item from an array
fixture.rand( [ "a", "b", "c" ], 1 )[ 0 ]; //-> "b"

// get 2 or 3 items from the array
fixture.rand( [ "a", "b", "c" ], 2, 3 ); //-> ["c","a","b"]
```
  @param {Array} choices An array of values to chose from. The returned array will only include a value once.
  @param {Number} [min] The minimum number of items to be in the returned array.
  @param {Number} [max] The maximum number of items in the returned array.
