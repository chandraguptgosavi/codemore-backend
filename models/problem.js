const mongoose = require("mongoose");

const problemSchema = mongoose.Schema({
  title: String,
  statement: String,
  input: String,
  output: String,
  sampleInput: String,
  sampleOutput: String,
  testCases: {
    count: Number,
    stdInput: String,
    stdOutput: String,
  },
});

module.exports = mongoose.model("Problem", problemSchema);
