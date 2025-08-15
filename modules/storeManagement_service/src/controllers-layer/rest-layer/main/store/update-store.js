const { UpdateStoreManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class UpdateStoreRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("updateStore", "updatestore", req, res);
    this.dataName = "store";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateStoreManager(this._req, "rest");
  }
}

const updateStore = async (req, res, next) => {
  const updateStoreRestController = new UpdateStoreRestController(req, res);
  try {
    await updateStoreRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateStore;
