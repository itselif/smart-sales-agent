const { ListInventoryMovementsManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class ListInventoryMovementsRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("listInventoryMovements", "listinventorymovements", req, res);
    this.dataName = "inventoryMovements";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListInventoryMovementsManager(this._req, "rest");
  }
}

const listInventoryMovements = async (req, res, next) => {
  const listInventoryMovementsRestController =
    new ListInventoryMovementsRestController(req, res);
  try {
    await listInventoryMovementsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listInventoryMovements;
