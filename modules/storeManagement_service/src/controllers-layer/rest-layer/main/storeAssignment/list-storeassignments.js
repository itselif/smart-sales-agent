const { ListStoreAssignmentsManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class ListStoreAssignmentsRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("listStoreAssignments", "liststoreassignments", req, res);
    this.dataName = "storeAssignments";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListStoreAssignmentsManager(this._req, "rest");
  }
}

const listStoreAssignments = async (req, res, next) => {
  const listStoreAssignmentsRestController =
    new ListStoreAssignmentsRestController(req, res);
  try {
    await listStoreAssignmentsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listStoreAssignments;
