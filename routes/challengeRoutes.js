// --------- IMPORTING MODULES

const express = require('express');

const challengeController = require('../controllers/challengeController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

// Express router creation
const router = express.Router();

// -------------- ROUTES ----------------

router
  .route('/')
  .get(protect(), challengeController.getAllChallenges)
  .post(protect('role'), restrictTo('admin'), challengeController.createChallenge);

router
  .route('/:id')
  .get(protect(), challengeController.getChallenge)
  .patch(protect('role'), restrictTo('admin'), challengeController.updateChallenge)
  .delete(protect('role'), restrictTo('admin'), challengeController.deleteChallenge);

router.route('/:id/submit-solution').patch(protect(), challengeController.solveChallenge);
// --------------- MODULE EXPORT -----------------

module.exports = router;
