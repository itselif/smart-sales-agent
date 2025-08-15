const ReportingServiceGrpcController = require("./ReportingServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new ReportingServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
