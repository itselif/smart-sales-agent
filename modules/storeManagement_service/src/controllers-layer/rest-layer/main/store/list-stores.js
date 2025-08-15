const { ListStoresManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class ListStoresRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("listStores", "liststores", req, res);
    this.dataName = "stores";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListStoresManager(this._req, "rest");
  }
}

const listStores = async (req, res, next) => {
  const listStoresRestController = new ListStoresRestController(req, res);
  try {
    await listStoresRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listStores;
