const { DeleteUserManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class DeleteUserGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("deleteUser", "deleteuser", call, callback);
    this.crudType = "delete";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new DeleteUserManager(this.request, "grpc");
  }
}

const deleteUser = async (call, callback) => {
  try {
    const controller = new DeleteUserGrpcController(call, callback);
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

module.exports = deleteUser;
