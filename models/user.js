const mongoose = require('mongoose');

const userSubmissionSchema = mongoose.Schema({
  problemID: mongoose.SchemaTypes.ObjectId,
  problemTitle: String,
  status: {
    id: Number,
    description: String,
  },
});

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    submissions: [userSubmissionSchema],
});

module.exports = mongoose.model('User', userSchema);