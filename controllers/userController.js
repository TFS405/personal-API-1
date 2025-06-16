// ---------- MODULE IMPORTS ---------------------

const { z } = require('zod');

const User = require('../models/userModel');
const handlerFactory = require('../utils/handlerFactory');

// ------------------- VARIABLES --------------------------------

const updateUserSchema = {
  username: z.string(),
  email: z.string().email(),
};

//-------------------- HANDLER FUNCTIONS ------------------------

exports.getAllUsers = handlerFactory.getAll(User);

exports.getUser = handlerFactory.getOne(User);

exports.updateUser = handlerFactory.updateUser(User, updateUserSchema, true);

exports.updatePassword = handlerFactory.updatePassword(User);

exports.deleteUser = handlerFactory.deleteOne(User);

exports.updateMyPassword = handlerFactory.updateMe(User, updateUserSchema, true);

exports.deleteMyAccount = handlerFactory.deleteMe(User);
