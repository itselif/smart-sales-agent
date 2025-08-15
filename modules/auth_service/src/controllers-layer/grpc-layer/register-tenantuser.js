const { RegisterTenantUserManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class RegisterTenantUserGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("registerTenantUser", "registertenantuser", call, callback);
    this.crudType = "create";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new RegisterTenantUserManager(this.request, "grpc");
  }
}

const registerTenantUser = async (call, callback) => {
  try {
    const controller = new RegisterTenantUserGrpcController(call, callback);
    await controller.processRequest();
  } catch (error) {
    const grpcError = {
      code: error.grpcStatus || status.INTERNAL,
      message:
        error.message || "An error occurred while processing the request.",
    };

    callback(grpcError);
  }
};

module.exports = registerTenantUser;
