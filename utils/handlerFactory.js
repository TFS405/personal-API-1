// ----------- IMPORT MODULES -------------------
const sendJsonRes = require('./sendJsonRes');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const APIFeatures = require('./apiFeatures');
const filterObj = require('../utils/filterObject');

// ----------- HANDLER FUNCTIONS ----------------

exports.getAll = (model, nameOfResourcePlural) => {
  return catchAsync(async (req, res, next) => {
    // Applying query parameters to search query
    const features = new APIFeatures(model.find(), req.query).filter();

    // Executing search query (that has been modified by query paremeters )
    const docs = await features.query;
    // Obtaining  the amount of results returned from search query
    const results = docs.length;

    if (!docs || typeof docs === 'null') {
      return next(
        new AppError(`${nameOfResourcePlural} not found! Please check your search query!`, 400)
      );
    }
    sendJsonRes(res, 200, {
      results,
      data: docs
    });
  });
};

exports.createOne = (model, allowedProperties) => {
  return catchAsync(async (req, res, next) => {
    // Make sure req.body is not empty!
    if (!req.body) {
      return next(new AppError(`Request body is empty. Please include data in the request`, 400));
    }

    const filteredObj = filterObj(allowedProperties, req.body);

    if (!filterObj) {
      return next(
        new AppError(
          'No valid properties recieved in the request body, please submit a valid property!'
        )
      );
    }
  });
};
