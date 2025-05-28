// --------- IMPORTING MODULES

const mongoose = require('mongoose');
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
  .patch(protect(), challengeController.updateChallenge)
  .delete(protect(), restrictTo('admin'), challengeController.deleteChallenge);
// --------------- MODULE EXPORT -----------------
module.exports = router;
