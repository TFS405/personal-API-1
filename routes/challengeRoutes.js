// --------- IMPORTING MODULES

const mongoose = require('mongoose');
const express = require('express');

const challengeController = require('../controllers/challengeController');
const protect = require('../middlewares/protect');

// Express router creation
const router = express.Router();

// -------------- ROUTES ----------------

router.route('/').post(protect, challengeController.createChallenge);

// --------------- MODULE EXPORT -----------------
module.exports = router;
