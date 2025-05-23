// ----------- IMPORT MODULES -------------------

const sendJsonRes = require('./sendJsonRes');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const APIFeatures = require('./apiFeatures');
const filterObj = require('./filterObject.js');
const zodValidator = require('./zodValidator.js');

// ----------- HANDLER FUNCTIONS ----------------

exports.getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    // Applying query parameters to search query
    const features = new APIFeatures(model.find(), req.query).filter();

    // Executing search query (that has been modified by query paremeters such as filter, sort, limit, paginate)
    const docs = await features.query;
    // Obtaining  the amount of results returned from search query
    const results = docs.length;

    // Making sure that "docs" is not an empty / falsy value.
    if (!docs || docs.length === 0) {
      return next(
        new AppError(`Search query returned no results! Please check your search query!`, 404)
      );
    }
    // Sending JSON response
    sendJsonRes(res, 200, {
      results,
      data: docs
    });
  });
};

exports.createOne = (model, updatableFields, zodSchema) => {
  return catchAsync(async (req, res, next) => {
    // Make sure request body is not empty, and that it actually has at least one key!
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError(`Request body is empty. Please include data in the request`, 400));
    }

    // Filter the request body
    const filtered = filterObj(updatableFields, req.body);

    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid properties received in the request body, please submit a valid property!'
        )
      );
    }
    // Validate the request body
    zodValidator(zodSchema, filtered);

    // Save the request body
    const doc = await model.create(filtered);

    // Return JSON response
    sendJsonRes(res, 201, {
      data: { doc }
    });
  });
};

exports.deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No resource found with that ID!', 404));
    }

    sendJsonRes(res, 204, {});
  });
};
