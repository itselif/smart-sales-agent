const { UpdatePasswordManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class UpdatePasswordGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("updatePassword", "updatepassword", call, callback);
    this.crudType = "update";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new UpdatePasswordManager(this.request, "grpc");
  }
}

const updatePassword = async (call, callback) => {
  try {
    const controller = new UpdatePasswordGrpcController(call, callback);
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

module.exports = updatePassword;
