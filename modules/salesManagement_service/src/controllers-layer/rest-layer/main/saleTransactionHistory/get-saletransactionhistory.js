const { GetSaleTransactionHistoryManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class GetSaleTransactionHistoryRestController extends SalesManagementRestController {
  constructor(req, res) {
    super("getSaleTransactionHistory", "getsaletransactionhistory", req, res);
    this.dataName = "saleTransactionHistory";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetSaleTransactionHistoryManager(this._req, "rest");
  }
}

const getSaleTransactionHistory = async (req, res, next) => {
  const getSaleTransactionHistoryRestController =
    new GetSaleTransactionHistoryRestController(req, res);
  try {
    await getSaleTransactionHistoryRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getSaleTransactionHistory;
