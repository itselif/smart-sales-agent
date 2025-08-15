const { CreateGroupMemberManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class CreateGroupMemberRestController extends AuthRestController {
  constructor(req, res) {
    super("createGroupMember", "creategroupmember", req, res);
    this.dataName = "userGroupMember";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateGroupMemberManager(this._req, "rest");
  }
}

const createGroupMember = async (req, res, next) => {
  const createGroupMemberRestController = new CreateGroupMemberRestController(
    req,
    res,
  );
  try {
    await createGroupMemberRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createGroupMember;
