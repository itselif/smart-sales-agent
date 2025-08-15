const { CreateGroupManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class CreateGroupRestController extends AuthRestController {
  constructor(req, res) {
    super("createGroup", "creategroup", req, res);
    this.dataName = "userGroup";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateGroupManager(this._req, "rest");
  }
}

const createGroup = async (req, res, next) => {
  const createGroupRestController = new CreateGroupRestController(req, res);
  try {
    await createGroupRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createGroup;
