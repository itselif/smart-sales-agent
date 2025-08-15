const { GetLowStockAlertManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class GetLowStockAlertRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("getLowStockAlert", "getlowstockalert", req, res);
    this.dataName = "lowStockAlert";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetLowStockAlertManager(this._req, "rest");
  }
}

const getLowStockAlert = async (req, res, next) => {
  const getLowStockAlertRestController = new GetLowStockAlertRestController(
    req,
    res,
  );
  try {
    await getLowStockAlertRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getLowStockAlert;
