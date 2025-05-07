// --------- IMPORTING MODULES -------------------

const express = require('express');
const mongoose = require('mongoose');

const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');

// Express app creation
const app = express();

// ------------------- MIDDLEWARE ---------------------

// Utilizing a module named Morgan which will log all incoming http request to the terminal, allowing request observations to be made
app.use(morgan('dev'));

// -------------- ROUTES ------------------

app.use('/users', userRouter);

//--------- EXPORTING MODULE ---------------

module.exports = app;
