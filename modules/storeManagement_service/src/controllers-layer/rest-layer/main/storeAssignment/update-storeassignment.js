const { UpdateStoreAssignmentManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class UpdateStoreAssignmentRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("updateStoreAssignment", "updatestoreassignment", req, res);
    this.dataName = "storeAssignment";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateStoreAssignmentManager(this._req, "rest");
  }
}

const updateStoreAssignment = async (req, res, next) => {
  const updateStoreAssignmentRestController =
    new UpdateStoreAssignmentRestController(req, res);
  try {
    await updateStoreAssignmentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateStoreAssignment;
