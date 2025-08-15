const InventoryManagementServiceGrpcController = require("./InventoryManagementServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new InventoryManagementServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
