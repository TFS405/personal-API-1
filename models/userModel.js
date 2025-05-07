// ------------- IMPORTING MODULES ----------------------

const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

//----------- SCHEMAS ----------------------

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

//---------------------- MODELS -----------------------------

// Creating a model named User to represent and hold application user data
const User = mongoose.model('User', userSchema);

//------------------ EXPORTS ----------------------------

module.exports = User;
