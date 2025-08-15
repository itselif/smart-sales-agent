const { DeleteStoreManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class DeleteStoreRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("deleteStore", "deletestore", req, res);
    this.dataName = "store";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteStoreManager(this._req, "rest");
  }
}

const deleteStore = async (req, res, next) => {
  const deleteStoreRestController = new DeleteStoreRestController(req, res);
  try {
    await deleteStoreRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteStore;
