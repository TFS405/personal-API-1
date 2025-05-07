// REQUIRING ALL MODULES
const authController = require('../controllers/authController');
// Creating a variable named "router" that is an instance of express.router, that will ROUTE all req properly to the appropriate handlers
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.route('/').get(userController.getAllUsers);

router.route('/signup').post(userController.signup);

module.exports = router;
