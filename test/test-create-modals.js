const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;

const {createModal, formatAuthors, createRefinedButton} = require("../public/scripts/create-modals.js");

describe("formatAuthors", function() {
  it("should throw TypeError when input is not iterable", function() {
    const nonIterableInput = 1;
    expect(() => formatAuthors(nonIterableInput)).to.throw(TypeError, "authors is not iterable");
  });
  it("should return empty string when input is an empty array", function() {
    const emptyArrayAsInput = [];

    const expected = "";
    const actual = formatAuthors(emptyArrayAsInput);

    assert.equal(expected, actual);
  });
  it ("should return the correct string with a simple, one author input", function() {
    const simpleInput = [{"FirstName": "first", "LastName": "last"}];

    const expected = "first last";
    const actual = formatAuthors(simpleInput);

    assert.equal(expected, actual);
  });
  it ("should return the correct string with a simple, two author input", function() {
    const simpleInput = [
      {"FirstName": "first_one", "LastName": "last_one"},
      {"FirstName": "first_second", "LastName": "last_second"}
    ];

    const expected = "first_one last_one, first_second last_second";
    const actual = formatAuthors(simpleInput);

    assert.equal(expected, actual);
  });
});
