const { DeleteLowStockAlertManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class DeleteLowStockAlertRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("deleteLowStockAlert", "deletelowstockalert", req, res);
    this.dataName = "lowStockAlert";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteLowStockAlertManager(this._req, "rest");
  }
}

const deleteLowStockAlert = async (req, res, next) => {
  const deleteLowStockAlertRestController =
    new DeleteLowStockAlertRestController(req, res);
  try {
    await deleteLowStockAlertRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteLowStockAlert;
