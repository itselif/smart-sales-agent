const { ResolveLowStockAlertManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class ResolveLowStockAlertRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("resolveLowStockAlert", "resolvelowstockalert", req, res);
    this.dataName = "lowStockAlert";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new ResolveLowStockAlertManager(this._req, "rest");
  }
}

const resolveLowStockAlert = async (req, res, next) => {
  const resolveLowStockAlertRestController =
    new ResolveLowStockAlertRestController(req, res);
  try {
    await resolveLowStockAlertRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = resolveLowStockAlert;
