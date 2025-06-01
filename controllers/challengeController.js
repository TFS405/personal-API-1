// ---------------- IMPORTING MODULES ------------------

const { z } = require('zod');

const Challenge = require('../models/challengesModel');
const handlerFactory = require('../utils/handlerFactory');

// --------------------- VARIABLES ------------------

// Whitelist of properties (excluding "challengeSolution (which is still approved)")
const schemaShape = {
  category: z.string(),
  difficulty: z.string(),
  challengeTask: z.string(),
  challengeSolution: z.string()
};
const solutionSchemaShape = {
  challengeAttempt: z.string(),
  challengeSolution: z.string()
};

// -------------- CONTROLLER FUNCTIONS --------------

exports.getAllChallenges = handlerFactory.getAll(Challenge);

exports.getChallenge = handlerFactory.getOne(Challenge);

exports.createChallenge = handlerFactory.createOne(
  Challenge,
  schemaShape,
  Object.keys(schemaShape)
);

exports.updateChallenge = handlerFactory.updateOne(Challenge, schemaShape, {
  isZodSchemaPartial: true
});

exports.deleteChallenge = handlerFactory.deleteOne(Challenge);

exports.solveChallenge = handlerFactory.updateOne(Challenge, solutionSchemaShape, {
  isZodSchemaPartial: true,
  configErrorMessage: {
    emptyBodyString: 'Please provide a solution!',
    noValidFieldsString:
      'Invalid request body. A "challengeAttempt" field is required to submit a solution.'
  },
  configJsonRes: { selectJsonResFields: ['challengeAttempt', 'challengeSolution'] }
});
