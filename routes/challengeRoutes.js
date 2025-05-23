// --------- IMPORTING MODULES

const mongoose = require('mongoose');
const express = require('express');

const challengeController = require('../controllers/challengeController');
const protect = require('../middlewares/protect');

// Express router creation
const router = express.Router();

// -------------- ROUTES ----------------

router
  .route('/')
  .get(protect, challengeController.getAllChallenges)
  .post(protect, challengeController.createChallenge);

router.route('/:id').delete(protect, challengeController.deleteChallenge);
// --------------- MODULE EXPORT -----------------
module.exports = router;
