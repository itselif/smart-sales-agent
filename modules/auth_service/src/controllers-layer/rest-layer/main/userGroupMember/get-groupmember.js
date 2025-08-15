const { GetGroupMemberManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class GetGroupMemberRestController extends AuthRestController {
  constructor(req, res) {
    super("getGroupMember", "getgroupmember", req, res);
    this.dataName = "userGroupMember";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetGroupMemberManager(this._req, "rest");
  }
}

const getGroupMember = async (req, res, next) => {
  const getGroupMemberRestController = new GetGroupMemberRestController(
    req,
    res,
  );
  try {
    await getGroupMemberRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getGroupMember;
