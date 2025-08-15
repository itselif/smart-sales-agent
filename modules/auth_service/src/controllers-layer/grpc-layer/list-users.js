const { ListUsersManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class ListUsersGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("listUsers", "listusers", call, callback);
    this.crudType = "getList";
    this.dataName = "users";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new ListUsersManager(this.request, "grpc");
  }
}

const listUsers = async (call, callback) => {
  try {
    const controller = new ListUsersGrpcController(call, callback);
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

module.exports = listUsers;
