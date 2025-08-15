const { RegisterTenantUserManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class RegisterTenantUserRestController extends AuthRestController {
  constructor(req, res) {
    super("registerTenantUser", "registertenantuser", req, res);
    this.dataName = "user";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new RegisterTenantUserManager(this._req, "rest");
  }
}

const registerTenantUser = async (req, res, next) => {
  const registerTenantUserRestController = new RegisterTenantUserRestController(
    req,
    res,
  );
  try {
    await registerTenantUserRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = registerTenantUser;
