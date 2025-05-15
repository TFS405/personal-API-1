const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

//---------- MODULE EXPORT -------------

module.exports = catchAsync;
