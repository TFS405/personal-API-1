// ----------- IMPORT MODULES -------------------
const sendJsonRes = require('./sendJsonRes');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const APIFeatures = require('./apiFeatures');

// ----------- HANDLER FUNCTIONS ----------------

exports.getAll = (model, nameOfResourcePlural) => {
  return catchAsync(async (req, res, next) => {
    // Applying query parameters to search query
    const features = new APIFeatures(model.find(), req.query).filter();

    // Executing search query (that has been modified by query paremeters )
    const docs = await features.query;
    const results = docs.Length;

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
