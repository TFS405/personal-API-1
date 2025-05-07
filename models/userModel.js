// REQUIRING ALL MODULES
const mongoose = require('mongoose');
const { Schema } = mongoose;

const validator = require('validator');

// Creating the USER schema

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Please provide a valid email!']
  }
});

// Creating a model / collection named Users --- uses the userSchema schema
const User = mongoose.model('User', userSchema);

module.exports = User;
