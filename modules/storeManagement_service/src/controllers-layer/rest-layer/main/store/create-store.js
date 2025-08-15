const { CreateStoreManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class CreateStoreRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("createStore", "createstore", req, res);
    this.dataName = "store";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateStoreManager(this._req, "rest");
  }
}

const createStore = async (req, res, next) => {
  const createStoreRestController = new CreateStoreRestController(req, res);
  try {
    await createStoreRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createStore;
