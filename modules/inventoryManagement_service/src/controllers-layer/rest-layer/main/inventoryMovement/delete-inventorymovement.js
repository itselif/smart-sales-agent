const { DeleteInventoryMovementManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class DeleteInventoryMovementRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("deleteInventoryMovement", "deleteinventorymovement", req, res);
    this.dataName = "inventoryMovement";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteInventoryMovementManager(this._req, "rest");
  }
}

const deleteInventoryMovement = async (req, res, next) => {
  const deleteInventoryMovementRestController =
    new DeleteInventoryMovementRestController(req, res);
  try {
    await deleteInventoryMovementRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteInventoryMovement;
