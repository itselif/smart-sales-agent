const { DeleteSaleTransactionManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class DeleteSaleTransactionRestController extends SalesManagementRestController {
  constructor(req, res) {
    super("deleteSaleTransaction", "deletesaletransaction", req, res);
    this.dataName = "saleTransaction";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteSaleTransactionManager(this._req, "rest");
  }
}

const deleteSaleTransaction = async (req, res, next) => {
  const deleteSaleTransactionRestController =
    new DeleteSaleTransactionRestController(req, res);
  try {
    await deleteSaleTransactionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteSaleTransaction;
