const { DeleteInventoryItemManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class DeleteInventoryItemRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("deleteInventoryItem", "deleteinventoryitem", req, res);
    this.dataName = "inventoryItem";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteInventoryItemManager(this._req, "rest");
  }
}

const deleteInventoryItem = async (req, res, next) => {
  const deleteInventoryItemRestController =
    new DeleteInventoryItemRestController(req, res);
  try {
    await deleteInventoryItemRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteInventoryItem;
