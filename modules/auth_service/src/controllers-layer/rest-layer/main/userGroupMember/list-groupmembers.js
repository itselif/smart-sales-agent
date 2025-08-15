const { ListGroupMembersManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class ListGroupMembersRestController extends AuthRestController {
  constructor(req, res) {
    super("listGroupMembers", "listgroupmembers", req, res);
    this.dataName = "userGroupMembers";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListGroupMembersManager(this._req, "rest");
  }
}

const listGroupMembers = async (req, res, next) => {
  const listGroupMembersRestController = new ListGroupMembersRestController(
    req,
    res,
  );
  try {
    await listGroupMembersRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listGroupMembers;
