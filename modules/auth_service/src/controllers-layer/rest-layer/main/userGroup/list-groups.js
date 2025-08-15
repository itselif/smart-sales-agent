const { ListGroupsManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class ListGroupsRestController extends AuthRestController {
  constructor(req, res) {
    super("listGroups", "listgroups", req, res);
    this.dataName = "userGroups";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListGroupsManager(this._req, "rest");
  }
}

const listGroups = async (req, res, next) => {
  const listGroupsRestController = new ListGroupsRestController(req, res);
  try {
    await listGroupsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listGroups;
