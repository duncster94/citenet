[![Build Status](https://travis-ci.com/JohnGiorgi/citenet.svg?token=EUZJKa8zDUAWsAbyhiwg&branch=master)](https://travis-ci.com/JohnGiorgi/citenet)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b30802de070143a2a6d24328cac01d36)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=JohnGiorgi/citenet&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/b30802de070143a2a6d24328cac01d36)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=JohnGiorgi/citenet&utm_campaign=Badge_Coverage)

# CiteNet

Please see the wiki for more in-depth details.

## Usage

### Installation

To install and run locally

```
$ npm install
$ npm start
```

optionally, you can run it with `nodemon` so that any changes cause the server to restart automatically

```
$ npm install -g nodemon
$ nodemon app.js
```

### Testing

To run the unit test suite, call

```
$ npm test
```

To run the same test suite with coverage, call

```
$ npm test-with-coverage
```

an `html` file with coverage results will be found in `coverage/lcov-report/index.html`.
