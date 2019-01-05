const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;

const {createModal, formatAuthors, createRefinedButton} = require("../public/scripts/create-modals.js");

describe('formatAuthors', function() {
  it('should throw TypeError when input is not iterable', function() {
    nonIterableInput = {};
    expect(() => formatAuthors(nonIterableInput)).to.throw(TypeError, "authors is not iterable");
  });
  it('should return empty string when input is an empty array', function() {
    emptyArrayAsInput = [];

    expected = '';
    actual = formatAuthors(emptyArrayAsInput);

    assert.equal(expected, actual);
  });
  it ('should return the correct string with a simple, one author input', function() {
    simpleInput = [{"FirstName": "first", "LastName": "last"}];

    expected = 'first last';
    actual = formatAuthors(simpleInput);

    assert.equal(expected, actual);
  });
  it ('should return the correct string with a simple, two author input', function() {
    simpleInput = [
      {"FirstName": "first_one", "LastName": "last_one"},
      {"FirstName": "first_second", "LastName": "last_second"}
    ];

    expected = 'first_one last_one, first_second last_second';
    actual = formatAuthors(simpleInput);

    assert.equal(expected, actual);
  });
});
