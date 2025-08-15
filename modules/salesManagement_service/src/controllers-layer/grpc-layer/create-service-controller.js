const SalesManagementServiceGrpcController = require("./SalesManagementServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new SalesManagementServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
