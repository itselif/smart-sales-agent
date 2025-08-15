const { CreateLowStockAlertManager } = require("managers");

const InventoryManagementRestController = require("../../InventoryManagementServiceRestController");

class CreateLowStockAlertRestController extends InventoryManagementRestController {
  constructor(req, res) {
    super("createLowStockAlert", "createlowstockalert", req, res);
    this.dataName = "lowStockAlert";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateLowStockAlertManager(this._req, "rest");
  }
}

const createLowStockAlert = async (req, res, next) => {
  const createLowStockAlertRestController =
    new CreateLowStockAlertRestController(req, res);
  try {
    await createLowStockAlertRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createLowStockAlert;
