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

// -------------- CONTROLLER FUNCTIONS --------------

exports.getAllChallenges = handlerFactory.getAll(Challenge);

exports.getChallenge = handlerFactory.getOne(Challenge);

exports.createChallenge = handlerFactory.createOne(
  Challenge,
  schemaShape,
  Object.keys(schemaShape)
);

exports.updateChallenge = handlerFactory.updateOne(
  Challenge,
  schemaShape,
  Object.keys(schemaShape)
);

exports.deleteChallenge = handlerFactory.deleteOne(Challenge);
