const { CreateInventoryMovementManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class CreateInventoryMovementRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("createInventoryMovement", "createinventorymovement", req, res);
    this.dataName = "inventoryMovement";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateInventoryMovementManager(this._req, "rest");
  }
}

const createInventoryMovement = async (req, res, next) => {
  const createInventoryMovementRestController =
    new CreateInventoryMovementRestController(req, res);
  try {
    await createInventoryMovementRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createInventoryMovement;
