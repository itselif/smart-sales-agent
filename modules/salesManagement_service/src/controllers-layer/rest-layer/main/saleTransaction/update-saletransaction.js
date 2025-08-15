const { UpdateSaleTransactionManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class UpdateSaleTransactionRestController extends SalesManagementRestController {
  constructor(req, res) {
    super("updateSaleTransaction", "updatesaletransaction", req, res);
    this.dataName = "saleTransaction";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateSaleTransactionManager(this._req, "rest");
  }
}

const updateSaleTransaction = async (req, res, next) => {
  const updateSaleTransactionRestController =
    new UpdateSaleTransactionRestController(req, res);
  try {
    await updateSaleTransactionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateSaleTransaction;
