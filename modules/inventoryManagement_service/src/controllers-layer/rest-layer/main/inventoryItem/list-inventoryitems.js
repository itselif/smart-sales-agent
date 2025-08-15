const { ListInventoryItemsManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class ListInventoryItemsRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("listInventoryItems", "listinventoryitems", req, res);
    this.dataName = "inventoryItems";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListInventoryItemsManager(this._req, "rest");
  }
}

const listInventoryItems = async (req, res, next) => {
  const listInventoryItemsRestController = new ListInventoryItemsRestController(
    req,
    res,
  );
  try {
    await listInventoryItemsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listInventoryItems;
