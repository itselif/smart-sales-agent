const { DeleteStoreAssignmentManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class DeleteStoreAssignmentRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("deleteStoreAssignment", "deletestoreassignment", req, res);
    this.dataName = "storeAssignment";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteStoreAssignmentManager(this._req, "rest");
  }
}

const deleteStoreAssignment = async (req, res, next) => {
  const deleteStoreAssignmentRestController =
    new DeleteStoreAssignmentRestController(req, res);
  try {
    await deleteStoreAssignmentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteStoreAssignment;
