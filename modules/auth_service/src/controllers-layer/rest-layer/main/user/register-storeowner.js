const { RegisterStoreOwnerManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class RegisterStoreOwnerRestController extends AuthRestController {
  constructor(req, res) {
    super("registerStoreOwner", "registerstoreowner", req, res);
    this.dataName = "user";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new RegisterStoreOwnerManager(this._req, "rest");
  }
}

const registerStoreOwner = async (req, res, next) => {
  const registerStoreOwnerRestController = new RegisterStoreOwnerRestController(
    req,
    res,
  );
  try {
    await registerStoreOwnerRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = registerStoreOwner;
