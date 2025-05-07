// ESTABLISH ENVIRONMENTAL VARIABLES
require('dotenv').config({ path: `${__dirname}/.env` });

// IMPORT ALL MODULES
const mongoose = require('mongoose');

// Will connect to MongoDB, then immediately initate a server.

const connectDB = async (port) => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log('DB Connected! 🚀');
  } catch (err) {
    console.log('An error occured! 🚫');
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
