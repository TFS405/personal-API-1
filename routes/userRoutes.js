// ----------  IMPORTING MODULES -----------------

const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');

// Express router creation
const router = express.Router();

// ------------ ROUTES -----------------

router.route('/').get(protect, userController.getAllUsers);

router.route('/login').post(authController.login);

// router.route('/:id').get(protect, authController.getUser);

router.route('/signup').post(authController.signup);

router.route('/deleteUser').delete(protect, userController.deleteUser);

// --------------EXPORTING MODULE ------------

module.exports = router;
