const { RegisterStoreOwnerManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class RegisterStoreOwnerGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("registerStoreOwner", "registerstoreowner", call, callback);
    this.crudType = "create";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new RegisterStoreOwnerManager(this.request, "grpc");
  }
}

const registerStoreOwner = async (call, callback) => {
  try {
    const controller = new RegisterStoreOwnerGrpcController(call, callback);
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

module.exports = registerStoreOwner;
