const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const InventoryManagementServiceManager = require("../../service-manager/InventoryManagementServiceManager");

/* Base Class For the Crud Routes Of DbObject LowStockAlert */
class LowStockAlertManager extends InventoryManagementServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "lowStockAlert";
    this.modelName = "LowStockAlert";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = LowStockAlertManager;
