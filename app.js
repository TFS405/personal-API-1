const express = require('express');
// Exporting the app variable to be used in different files of the project
const app = express();

const mongoose = require('mongoose');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');

// MIDDLEWARE

// Utilizing a module named Morgan which will log all incoming http request to the terminal, allowing request observations to be made
app.use(morgan('dev'));

app.use('/users', userRouter);

module.exports = app;
