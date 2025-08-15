const { DeleteGroupMemberManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class DeleteGroupMemberRestController extends AuthRestController {
  constructor(req, res) {
    super("deleteGroupMember", "deletegroupmember", req, res);
    this.dataName = "userGroupMember";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteGroupMemberManager(this._req, "rest");
  }
}

const deleteGroupMember = async (req, res, next) => {
  const deleteGroupMemberRestController = new DeleteGroupMemberRestController(
    req,
    res,
  );
  try {
    await deleteGroupMemberRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteGroupMember;
