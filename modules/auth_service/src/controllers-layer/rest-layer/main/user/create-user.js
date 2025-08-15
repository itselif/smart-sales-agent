const { CreateUserManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class CreateUserRestController extends AuthRestController {
  constructor(req, res) {
    super("createUser", "createuser", req, res);
    this.dataName = "user";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateUserManager(this._req, "rest");
  }
}

const createUser = async (req, res, next) => {
  const createUserRestController = new CreateUserRestController(req, res);
  try {
    await createUserRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createUser;
