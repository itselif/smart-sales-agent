const GrpcController = require("./GrpcController");

class AuthServiceGrpcController extends GrpcController {
  constructor(name, routeName, call, callback) {
    super(name, routeName, call, callback);
    this.projectCodename = "salesai1";
    this.isMultiTenant = true;
    this.tenantName = "store";
    this.tenantId = "storeId";
    this.tenantCodename = null;
    this.isLoginApi = true;
  }

  createApiManager() {
    return null;
  }
}

module.exports = AuthServiceGrpcController;
