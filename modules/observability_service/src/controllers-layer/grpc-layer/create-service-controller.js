const ObservabilityServiceGrpcController = require("./ObservabilityServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new ObservabilityServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
