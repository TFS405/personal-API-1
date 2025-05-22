// ---------------- IMPORTING MODULES ------------------

const { z } = require('zod');

const Challenge = require('../models/challengesModel');
const sendJsonRes = require('../utils/sendJsonRes');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// --------------------- VARIABLES ------------------

const updatableFields = [
  'category',
  'difficulty',
  'challengeTask',
  'challengeAttempt',
  'challengeSolution'
];

const dataTypeValidator = {
  category: z.string(),
  difficulty: z.string(),
  challengeTask: z.string(),
  challengeSolution: z.string()
};

// -------------- CONTROLLER FUNCTIONS --------------

exports.getAllChallenges = handlerFactory.getAll(Challenge);

exports.createChallenge = handlerFactory.createOne(Challenge, updatableFields, dataTypeValidator);
