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
