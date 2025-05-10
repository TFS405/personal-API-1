// --------- IMPORTING MODULES -------------------

const express = require('express');
const mongoose = require('mongoose');

const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const AppError = require('./utility/appError');
const sendJsonRes = require('./utility/sendJsonRes');

// Express app creation
const app = express();

// ------------------- MIDDLEWARE ---------------------

// Utilizing a module named Morgan which will log all incoming http request to the terminal, allowing request observations to be made
app.use(morgan('dev'));

// -------------- ROUTES ------------------

app.use('/users', userRouter);

// ------------- GLOBAL ERROR HANDLER ---------------

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return sendJsonRes(res, err.statusCode, { message: err.message });
  }

  return res.status(500).json({
    status: 'failed',
    message: 'No further information is available. Please  try again later!'
  });

  next();
});

//--------- EXPORTING MODULE --D-------------

module.exports = app;
