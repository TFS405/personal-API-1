// --------- IMPORTING MODULES -------------------

const express = require('express');
const mongoose = require('mongoose');

const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const AppError = require('./utility/appError');
const sendJsonRes = require('./utility/sendJsonRes');

// -------- LOADING ENV VARIABLES ---------------
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env') });

// Express app creation
const app = express();

// ------------------- MIDDLEWARE ---------------------
app.use(express.json());

// Utilizing a module named Morgan which will log all incoming http request to the terminal, allowing request observations to be made
app.use(morgan('dev'));

// -------------- ROUTES ------------------

app.use('/users', userRouter);

// ------------- ERROR HANDLERS ---------------

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return sendJsonRes(res, err.statusCode, { message: err.message });
  }
  // Aquiring the error name & message to facilitate proper error routing in respects to managing the json output
  const errName = err.name;
  const errMessage = err.message;

  if (errName === 'ValidationError') {
    return sendJsonRes(res, 400, { message: errMessage });
  }

  console.log(err);
  return res.status(500).json({
    status: 'failed',
    message: 'No further information is available. Please  try again later!'
  });

  next();
});

//--------- EXPORTING MODULE --D-------------

module.exports = app;
