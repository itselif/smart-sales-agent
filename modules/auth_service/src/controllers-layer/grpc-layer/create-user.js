const { CreateUserManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class CreateUserGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("createUser", "createuser", call, callback);
    this.crudType = "create";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new CreateUserManager(this.request, "grpc");
  }
}

const createUser = async (call, callback) => {
  try {
    const controller = new CreateUserGrpcController(call, callback);
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

module.exports = createUser;
