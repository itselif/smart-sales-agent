const { ListLowStockAlertsManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class ListLowStockAlertsRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("listLowStockAlerts", "listlowstockalerts", req, res);
    this.dataName = "lowStockAlerts";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListLowStockAlertsManager(this._req, "rest");
  }
}

const listLowStockAlerts = async (req, res, next) => {
  const listLowStockAlertsRestController = new ListLowStockAlertsRestController(
    req,
    res,
  );
  try {
    await listLowStockAlertsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listLowStockAlerts;
