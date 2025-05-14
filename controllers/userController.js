// ---------- MODULE IMPORTS ---------------------

const User = require('../models/userModel');
const sendJsonRes = require('../utility/sendJsonRes');
const AppError = require('../utility/appError');

//-------------------- HANDLER FUNCTIONS ------------------------

// Will return all users from the DB, with a field called "results" that equates to the total number of results return. (2 documents found? results = 2)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    sendJsonRes(res, 200, {
      totalResults: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getUser = async (req, res) => {
  // 1. Identify target user
  // 2.Verify permissions to retrieve user
  // 3. If authentication succesful, retrieve user
  // 4. Return JSON response
};

exports.deleteUser = async (req, res, next) => {
  // 1. Find and delete user resource
  let selectedId;
  if (!req.body?.id) {
    return next(new AppError('Please provide a user ID to delete!', 404));
  }
  selectedId = req.body.id;

  // 2. verify permisions to delete selected user
  if (!req.user._doc.role.includes('admin') && !(req.user.id === selectedId)) {
    return next(new AppError('You do not have permission to delete this user!', 401));
  }
  // 3. Proceed with user account deletion
  await User.findByIdAndDelete(selectedId);

  // 4. Send json response
  sendJsonRes(res, 204);
};
