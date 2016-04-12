First and foremost, thanks for contributing to can-fixture and CanJS! If you
have any questions, reach out to us on the [gitter channel](https://gitter.im/canjs/canjs).

The following details how to make contributions such as:

- [reporting bugs](#reporting-bugs)
- [suggesting features](#suggesting-features)
- [contributing code](#contributing-code), including:
  - [setting up your development environment]()
  - [exploring the code structure]()
  - [running the tests]()
  - [submitting a pull request]()
  - [making a release]()

## Reporting Bugs

Report a bug as a new [github issue].

When filing a bug, it is extremely helpful to include:

- A small example with [JSBin](https://justinbmeyer.jsbin.com/zixumu/2/edit?html,js,output).
- Breaking tests (optional)
- Proposed solutions (optional)

Please be as descriptive as possible and use as little code as possible to simulate the error.

## Suggesting Features

Report a feature request as a new [github issue].

## Contributing Code

#### Setting up your development environment

1. fork can-fixture
2. clone it
3. install dependencies with `npm install`

At this point you should be able to open `test/test.html` and see everything passing.

#### Exploring the code structure

- `fixture.js` - assembles all the other files into the final API.
- `core.js` - methods for adding, removing, and matching fixtures with AJAX requests.
- `xhr.js` - mock XHR object that can send requests to a fixture.
- `store.js` - provides a restful mock service layer.
- `build.js` - builds the AMD and `<script>` based files.
- `package.json` - lists all package dependencies and maintenance scripts.
- `helpers/` - helper functionality.
- `test/` - tests.

#### Running the tests

Run:

> npm test

#### Submitting a pull request

#### Making a release

- [ ] Make sure you have access to the `can-fixture` npm repository.
- [ ] Make sure you have the latest master checked out (which should have all changes merged in)

Run:

> npm run release:patch

You can substitute `patch` with `minor` or `major`.  


If something __breaks__ during the release, you may need to restore your environment by:

Making sure you are in the master branch and there is no `release branch`:

> git checkout master
> git branch -D release

Make sure any tag that got released is deleted

> git tag -d VERSION
> git push origin :refs/tags/VERSION
