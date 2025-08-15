const { GetStoreAssignmentManager } = require("managers");

const StoreManagementRestController = require("../../StoreManagementServiceRestController");

class GetStoreAssignmentRestController extends StoreManagementRestController {
  constructor(req, res) {
    super("getStoreAssignment", "getstoreassignment", req, res);
    this.dataName = "storeAssignment";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetStoreAssignmentManager(this._req, "rest");
  }
}

const getStoreAssignment = async (req, res, next) => {
  const getStoreAssignmentRestController = new GetStoreAssignmentRestController(
    req,
    res,
  );
  try {
    await getStoreAssignmentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getStoreAssignment;
