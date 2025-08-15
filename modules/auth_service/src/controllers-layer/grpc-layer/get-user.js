const { GetUserManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class GetUserGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("getUser", "getuser", call, callback);
    this.crudType = "get";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new GetUserManager(this.request, "grpc");
  }
}

const getUser = async (call, callback) => {
  try {
    const controller = new GetUserGrpcController(call, callback);
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

module.exports = getUser;
