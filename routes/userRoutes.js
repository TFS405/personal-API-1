// ----------  IMPORTING MODULES -----------------

const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController.js');

// Express router creation
const router = express.Router();

// ------------ ROUTES -----------------

router.route('/').get(userController.getAllUsers);

router.route('/signup').post(authController.signup);

// --------------EXPORTING MODULE ------------

module.exports = router;
