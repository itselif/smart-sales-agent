const { UpdateUserRoleManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class UpdateUserRoleGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("updateUserRole", "updateuserrole", call, callback);
    this.crudType = "update";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new UpdateUserRoleManager(this.request, "grpc");
  }
}

const updateUserRole = async (call, callback) => {
  try {
    const controller = new UpdateUserRoleGrpcController(call, callback);
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

module.exports = updateUserRole;
