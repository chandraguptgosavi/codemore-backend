const mongoose = require('mongoose');

const userProblemsSchema = mongoose.Schema({
  problemID: mongoose.SchemaTypes.ObjectId,
  status: {
    id: Number,
    description: String,
  },
});

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    problems: [userProblemsSchema],
});

module.exports = mongoose.model('User', userSchema);