// ----------- IMPORT MODULES -------------------
const sendJsonRes = require('../utility/sendJsonRes');
const catchAsync = require('../utility/catchAsync');
const AppError = require('./appError');
const APIFeatures = require('../utility/apiFeatures');

// ----------- HANDLER FUNCTIONS ----------------

exports.getAll = (model, nameOfResourcePlural) => {
  return catchAsync(async (req, res, next) => {
    // Applying query parameters to search query
    const features = APIFeatures(model.find(), req.query).filter();

    // Executing search query (that has been modified by query paremeters )
    const docs = await features.query;

    if (!docs || typeof docs === 'null') {
      return next(
        new AppError(`${nameOfResourcePlural} not found! Please check your search query!`, 400)
      );
    }
    sendJsonRes(res, 200, {
      data: docs
    });
  });
};
