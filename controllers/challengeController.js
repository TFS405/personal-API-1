// ---------------- IMPORTING MODULES ------------------

const { z } = require('zod');

const Challenge = require('../models/challengesModel');
const sendJsonRes = require('../utils/sendJsonRes');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// --------------------- VARIABLES ------------------
// Total list of updatable fields for create function
const createUpdatableFields = [
  'category',
  'difficulty',
  'challengeTask',
  'challengeAttempt',
  'challengeSolution'
];
// Validator for create functions
const createDataTypeValidator = {
  category: z.string(),
  difficulty: z.string(),
  challengeTask: z.string(),
  challengeSolution: z.string()
};

// -------------- CONTROLLER FUNCTIONS --------------

exports.getAllChallenges = handlerFactory.getAll(Challenge);

exports.getChallenge = handlerFactory.getOne(Challenge);

exports.createChallenge = handlerFactory.createOne(
  Challenge,
  createUpdatableFields,
  createDataTypeValidator
);

exports.deleteChallenge = handlerFactory.deleteOne(Challenge);
