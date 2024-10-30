// function that returns a function and it catches any error
module.exports.catchAsync = function (func) {
  return function (req, res, next) {
    func(req, res, next).catch(next);
  };
};
