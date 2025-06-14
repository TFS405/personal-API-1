// --------- IMPORTING MODULES -------------------

const express = require('express');

const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const challengeRouter = require('./routes/challengeRoutes');

const AppError = require('./utils/appError');
const sendJsonRes = require('./utils/sendJsonRes');
const devLog = require('./utils/devLogs');

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

app.use('/challenges', challengeRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ------------- ERROR HANDLERS --------

app.use((err, req, res) => {
  let message;
  if (err.message) {
    message = err.message;
  }

  let possibleErrorCode;
  if (err.code ?? err.cause?.code) {
    possibleErrorCode = err.code ?? err.cause.code;
  }

  if (err instanceof AppError) {
    return sendJsonRes(res, err.statusCode, { message: err.message });
  }

  // Managing validation errors
  if (err.name === 'ValidationError') {
    devLog(err);
    return sendJsonRes(res, 400, { message });
  }

  // Managing MongoDB duplicate-key errors
  if (possibleErrorCode === 11000) {
    devLog(err);
    return sendJsonRes(res, 400, { message: err.message });
  }

  // Managing castErrors
  if (err.name === 'CastError') {
    devLog(err);
    return sendJsonRes(res, 400, { message: err.message });
  }

  // Managing TypeErrors
  if (err.name === 'TypeError') {
    devLog(err);
    return sendJsonRes(res, 400, { message: err.message });
  }

  devLog(err);
  return res.status(500).json({
    status: 'failed',
    message: 'No further information is available. Please  try again later!',
  });
});

//--------- EXPORTING MODULE --D-------------

module.exports = app;
