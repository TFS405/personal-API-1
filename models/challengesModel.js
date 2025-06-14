const mongoose = require('mongoose');

const { Schema } = mongoose;

const challengesSchema = new Schema({
  category: {
    type: String,
    required: [true, 'A challenge must have a category! '],
  },
  difficulty: {
    type: String,
    required: [true, 'A challenge must have a difficulty'],
  },
  challengeTask: {
    type: String,
    required: [true, 'Please provide a challenge!'],
  },
  challengeAttempt: {
    type: String,
    select: false,
  },
  challengeSolution: {
    type: String,
    required: [true, 'A challenge must have a solution-reference'],
    select: false,
  },
});

const Challenge = mongoose.model('challenge', challengesSchema);

module.exports = Challenge;
