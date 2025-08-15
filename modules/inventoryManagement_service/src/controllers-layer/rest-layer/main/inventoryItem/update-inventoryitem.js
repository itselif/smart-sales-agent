const { UpdateInventoryItemManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class UpdateInventoryItemRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("updateInventoryItem", "updateinventoryitem", req, res);
    this.dataName = "inventoryItem";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateInventoryItemManager(this._req, "rest");
  }
}

const updateInventoryItem = async (req, res, next) => {
  const updateInventoryItemRestController =
    new UpdateInventoryItemRestController(req, res);
  try {
    await updateInventoryItemRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateInventoryItem;
