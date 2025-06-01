// ---------- MODULE IMPORTS ---------------------

const { z } = require('zod');

const User = require('../models/userModel');
const handlerFactory = require('../utils/handlerFactory');

// ------------------- VARIABLES --------------------------------

const schemaShape = {
  username: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  email: z.string()
};

//-------------------- HANDLER FUNCTIONS ------------------------

exports.getAllUsers = handlerFactory.getAll(User);

exports.getUser = handlerFactory.getOne(User);

exports.updateUser = handlerFactory.updateOne(User, schemaShape, { isZodSchemaPartial: true });

exports.deleteUser = handlerFactory.deleteOne(User);
