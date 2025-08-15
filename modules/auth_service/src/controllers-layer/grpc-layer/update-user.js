const { UpdateUserManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class UpdateUserGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("updateUser", "updateuser", call, callback);
    this.crudType = "update";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new UpdateUserManager(this.request, "grpc");
  }
}

const updateUser = async (call, callback) => {
  try {
    const controller = new UpdateUserGrpcController(call, callback);
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

module.exports = updateUser;
