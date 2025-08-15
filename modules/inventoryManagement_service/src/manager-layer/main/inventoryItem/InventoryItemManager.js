const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const InventoryManagementServiceManager = require("../../service-manager/InventoryManagementServiceManager");

/* Base Class For the Crud Routes Of DbObject InventoryItem */
class InventoryItemManager extends InventoryManagementServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "inventoryItem";
    this.modelName = "InventoryItem";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = InventoryItemManager;
