const catchAsync = (fn) => (req, res, next) => {
  console.log("--------------------------------------------------");
  console.log("Request Method: ", req.method);
  console.log("Request Path: ", req.path);
  console.log("Request Body: ", req.body);
  console.log("Request Query: ", req.query);
  console.log("Request Params: ", req.params);
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log("Request Error: ", err);
    next(err);
  });
  console.log("--------------------------------------------------");
};

module.exports = catchAsync;
