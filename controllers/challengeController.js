// ---------------- IMPORTING MODULES ------------------

const Challenge = require('../models/challengesModel');

const { z } = require('zod');

const sendJsonRes = require('../utility/sendJsonRes');
const catchAsync = require('../utility/catchAsync');
const AppError = require('../utility/appError');

// -------------- CONTROLLER FUNCTIONS --------------

exports.createChallenge = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError(400), 'No data received!');
  }

  // Validating input against schema value-types
  // 1A. Creating zod validation schema
  const validationResults = z
    .object({
      category: z.string(),
      difficulty: z.string(),
      challengeTask: z.string(),
      challengeSolution: z.string()
    })
    // 2. Validating incoming data against zod validation schema
    .safeParse({
      category: req.body.category,
      difficulty: req.body.difficulty,
      challengeTask: req.body.challengeTask,
      challengeSolution: req.body.challengeSolution
    });

  // If incoming data failed zod schema validation, format the message before sending to the express error handler in app.js
  if (!validationResults.success) {
    let errMessages = validationResults.error.errors.map((e) => `${e.path}: ${e.message}`);

    errMessages = errMessages.join(' || ').replace(',', '');

    return next(new AppError(errMessages, 400));
  }

  // Creating challenge from the data-type validated input
  const createdChallenge = await Challenge.create({
    category: req.body.category,
    difficulty: req.body.difficulty,
    challengeTask: req.body.challengeTask,
    challengeSolution: req.body.challengeSolution
  });

  sendJsonRes(res, 201, { Challenge: createdChallenge });
});
