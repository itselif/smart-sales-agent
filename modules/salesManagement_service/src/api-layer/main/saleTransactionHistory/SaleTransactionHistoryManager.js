const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const SalesManagementServiceManager = require("../../service-manager/SalesManagementServiceManager");

/* Base Class For the Crud Routes Of DbObject SaleTransactionHistory */
class SaleTransactionHistoryManager extends SalesManagementServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "saleTransactionHistory";
    this.modelName = "SaleTransactionHistory";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = SaleTransactionHistoryManager;
