const { UpdatePasswordManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class UpdatePasswordRestController extends AuthRestController {
  constructor(req, res) {
    super("updatePassword", "updatepassword", req, res);
    this.dataName = "user";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdatePasswordManager(this._req, "rest");
  }
}

const updatePassword = async (req, res, next) => {
  const updatePasswordRestController = new UpdatePasswordRestController(
    req,
    res,
  );
  try {
    await updatePasswordRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updatePassword;
