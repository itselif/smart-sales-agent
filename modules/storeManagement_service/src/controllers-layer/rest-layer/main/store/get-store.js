const { GetStoreManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class GetStoreRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("getStore", "getstore", req, res);
    this.dataName = "store";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetStoreManager(this._req, "rest");
  }
}

const getStore = async (req, res, next) => {
  const getStoreRestController = new GetStoreRestController(req, res);
  try {
    await getStoreRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getStore;
