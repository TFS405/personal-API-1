// ---------- MODULE IMPORTS ---------------------

const User = require('../models/userModel');
const sendJsonRes = require('../utility/sendJsonRes');

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

exports.deleteUser = async (req, res) => {
  // 1. Authenticate user request from JWT
  // 2. If authentication successful, authorize request
  // 3. Find and delete user resource
  // 4. Return JSON response.
};
