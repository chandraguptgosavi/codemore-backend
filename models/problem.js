const mongoose = require("mongoose");

const testCaseSchema = mongoose.Schema({
  count: Number,
  input: String,
  output: String,
});

const problemSchema = mongoose.Schema({
  title: String,
  statement: String,
  input: String,
  output: String,
  sampleTestCases: testCaseSchema,
  testCases: testCaseSchema,
});

module.exports = mongoose.model("Problem", problemSchema);
