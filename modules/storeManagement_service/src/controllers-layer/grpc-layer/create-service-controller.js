const StoreManagementServiceGrpcController = require("./StoreManagementServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new StoreManagementServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
