const { DeleteSaleTransactionHistoryManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class DeleteSaleTransactionHistoryRestController extends SalesManagementRestController {
  constructor(req, res) {
    super(
      "deleteSaleTransactionHistory",
      "deletesaletransactionhistory",
      req,
      res,
    );
    this.dataName = "saleTransactionHistory";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteSaleTransactionHistoryManager(this._req, "rest");
  }
}

const deleteSaleTransactionHistory = async (req, res, next) => {
  const deleteSaleTransactionHistoryRestController =
    new DeleteSaleTransactionHistoryRestController(req, res);
  try {
    await deleteSaleTransactionHistoryRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteSaleTransactionHistory;
