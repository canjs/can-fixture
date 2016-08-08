@function can-fixture.rand rand

@signature `fixture.rand(min, max)`

Returns a random integer in the range [min, max]. If only one argument is provided,
returns a random integer from [0, max].

```js
fixture.rand(1, 10) //-> Random number between 1 and 10 inclusive.
fixture.rand(10) //-> Random number between 0 and 10 inclusive.
```
  @param min {Number} TODO describe
  @param max {Number} TODO describe

@signature `fixture.rand(choices, min, max)`

An array of between min and max random items from choices. If only `min` is
provided, `max` will equal `min`.  If both `max` and `min` are not provided,
`min` will be 1 and `max` will be `choices.length`.

```js
// pick a random number of items from an array
fixture.rand(["a","b","c"]) //-> ["c"]
fixture.rand(["a","b","c"]) //-> ["b","a"]

// pick one item from an array
fixture.rand(["a","b","c"],1) //-> ["c"]

// get one item from an array
fixture.rand(["a","b","c"],1)[0] //-> "b"

// get 2 or 3 items from the array
fixture.rand(["a","b","c"],2,3) //-> ["c","a","b"]
```
  @param choices {Array} TODO describe
  @param min {Number} TODO describe
  @param max {Number} TODO describe
