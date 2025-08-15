const { UpdateGroupManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class UpdateGroupRestController extends AuthRestController {
  constructor(req, res) {
    super("updateGroup", "updategroup", req, res);
    this.dataName = "userGroup";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateGroupManager(this._req, "rest");
  }
}

const updateGroup = async (req, res, next) => {
  const updateGroupRestController = new UpdateGroupRestController(req, res);
  try {
    await updateGroupRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateGroup;
