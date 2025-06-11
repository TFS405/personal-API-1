// ----------------- IMPORTING MODULES --------------------------

const { z } = require('zod');

const User = require('../models/userModel');
const handlerFactory = require('../utils/handlerFactory');

// ---------------- VARIABLES --------------------

// A function that will create and assign a user a JWT

const schemaShape = {
  username: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
};

//-----------  HANDLER FUNCTIONS ---------------

exports.signup = handlerFactory.signupUser(User, schemaShape, Object.keys(schemaShape));

exports.login = handlerFactory.loginUser(User);

exports.forgotPassword = handlerFactory.forgotPassword(User);
