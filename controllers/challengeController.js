// ---------------- IMPORTING MODULES ------------------

const zod = require('../utils/zodValidator.js');
const Challenge = require('../models/challengesModel');
const sendJsonRes = require('../utils/sendJsonRes');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// --------------------- VARIABLES ------------------

// Whitelist of properties (excluding "challengeSolution (which is still approved)")
const updatableFields = {
  category: 'string',
  difficulty: 'string',
  challengeTask: 'string',
  challengeSolution: 'string'
};

// -------------- CONTROLLER FUNCTIONS --------------

exports.getAllChallenges = handlerFactory.getAll(Challenge);

exports.getChallenge = handlerFactory.getOne(Challenge);

exports.createChallenge = handlerFactory.createOne(
  Challenge,
  zod.createValidationSchema(updatableFields),
  Object.keys(updatableFields)
);

exports.updateChallenge = handlerFactory.updateOne(
  Challenge,
  zod.createValidationSchema(updatableFields, true),
  ...Object.keys(updatableFields)
);

exports.deleteChallenge = handlerFactory.deleteOne(Challenge);
