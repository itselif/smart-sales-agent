const PlatformAdminServiceGrpcController = require("./PlatformAdminServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new PlatformAdminServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
