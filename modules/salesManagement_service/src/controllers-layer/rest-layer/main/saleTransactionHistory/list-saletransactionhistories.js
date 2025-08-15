const { ListSaleTransactionHistoriesManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class ListSaleTransactionHistoriesRestController extends SalesManagementRestController {
  constructor(req, res) {
    super(
      "listSaleTransactionHistories",
      "listsaletransactionhistories",
      req,
      res,
    );
    this.dataName = "saleTransactionHistories";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListSaleTransactionHistoriesManager(this._req, "rest");
  }
}

const listSaleTransactionHistories = async (req, res, next) => {
  const listSaleTransactionHistoriesRestController =
    new ListSaleTransactionHistoriesRestController(req, res);
  try {
    await listSaleTransactionHistoriesRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listSaleTransactionHistories;
