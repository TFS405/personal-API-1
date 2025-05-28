// ----------  IMPORTING MODULES -----------------

const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

// Express router creation
const router = express.Router();

// ------------ ROUTES -----------------

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/').get(protect(), userController.getAllUsers);

router
  .route('/:id')
  .get(protect(), userController.getUser)
  .patch(protect('role'), restrictTo('admin'), userController.updateUser)
  .delete(protect('role'), restrictTo('admin'), userController.deleteUser);

// --------------EXPORTING MODULE ------------

module.exports = router;
