const { ListRegisteredStoresManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class ListRegisteredStoresRestController extends AuthRestController {
  constructor(req, res) {
    super("listRegisteredStores", "listregisteredstores", req, res);
    this.dataName = "stores";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListRegisteredStoresManager(this._req, "rest");
  }
}

const listRegisteredStores = async (req, res, next) => {
  const listRegisteredStoresRestController =
    new ListRegisteredStoresRestController(req, res);
  try {
    await listRegisteredStoresRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listRegisteredStores;
