const { GetInventoryMovementManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class GetInventoryMovementRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("getInventoryMovement", "getinventorymovement", req, res);
    this.dataName = "inventoryMovement";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetInventoryMovementManager(this._req, "rest");
  }
}

const getInventoryMovement = async (req, res, next) => {
  const getInventoryMovementRestController =
    new GetInventoryMovementRestController(req, res);
  try {
    await getInventoryMovementRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getInventoryMovement;
