const { CreateInventoryItemManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class CreateInventoryItemRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("createInventoryItem", "createinventoryitem", req, res);
    this.dataName = "inventoryItem";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateInventoryItemManager(this._req, "rest");
  }
}

const createInventoryItem = async (req, res, next) => {
  const createInventoryItemRestController =
    new CreateInventoryItemRestController(req, res);
  try {
    await createInventoryItemRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createInventoryItem;
