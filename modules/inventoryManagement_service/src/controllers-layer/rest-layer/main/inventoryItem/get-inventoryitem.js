const { GetInventoryItemManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class GetInventoryItemRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("getInventoryItem", "getinventoryitem", req, res);
    this.dataName = "inventoryItem";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetInventoryItemManager(this._req, "rest");
  }
}

const getInventoryItem = async (req, res, next) => {
  const getInventoryItemRestController = new GetInventoryItemRestController(
    req,
    res,
  );
  try {
    await getInventoryItemRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getInventoryItem;
