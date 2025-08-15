const { GetGroupManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class GetGroupRestController extends AuthRestController {
  constructor(req, res) {
    super("getGroup", "getgroup", req, res);
    this.dataName = "userGroup";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetGroupManager(this._req, "rest");
  }
}

const getGroup = async (req, res, next) => {
  const getGroupRestController = new GetGroupRestController(req, res);
  try {
    await getGroupRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getGroup;
