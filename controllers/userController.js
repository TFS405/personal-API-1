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

// -------- ADMIN ROUTES ---------------

exports.getAllUsers = handlerFactory.getAll(User);

exports.getUser = handlerFactory.getOne(User);

exports.updateUser = handlerFactory.updateUser(User, updateUserSchema, true);

exports.deleteUser = handlerFactory.deleteOne(User);

// -------- USER ROUTES -----------------

exports.updateMyPassword = handlerFactory.updateMyPassword(User);

exports.updateMe = handlerFactory.updateMe(User, updateUserSchema, true);

exports.deleteMe = handlerFactory.deleteMe(User);
