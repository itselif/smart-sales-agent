const { CreateStoreAssignmentManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class CreateStoreAssignmentRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("createStoreAssignment", "createstoreassignment", req, res);
    this.dataName = "storeAssignment";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateStoreAssignmentManager(this._req, "rest");
  }
}

const createStoreAssignment = async (req, res, next) => {
  const createStoreAssignmentRestController =
    new CreateStoreAssignmentRestController(req, res);
  try {
    await createStoreAssignmentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createStoreAssignment;
