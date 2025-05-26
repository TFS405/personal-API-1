// ----------------- IMPORTING MODULES --------------------------

const User = require('../models/userModel');
const handlerFactory = require('../utils/handlerFactory');

// ---------------- VARIABLES --------------------

// A function that will create and assign a user a JWT

const fieldDefinitions = {
  username: 'string',
  password: 'string',
  confirmPassword: 'string',
  email: 'string'
};

//-----------  HANDLER FUNCTIONS ---------------

exports.signup = handlerFactory.signupUser(User);

exports.login = handlerFactory.loginUser(User);
