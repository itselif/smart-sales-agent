const { ListSaleTransactionsManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class ListSaleTransactionsRestController extends SalesManagementRestController {
  constructor(req, res) {
    super("listSaleTransactions", "listsaletransactions", req, res);
    this.dataName = "saleTransactions";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListSaleTransactionsManager(this._req, "rest");
  }
}

const listSaleTransactions = async (req, res, next) => {
  const listSaleTransactionsRestController =
    new ListSaleTransactionsRestController(req, res);
  try {
    await listSaleTransactionsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listSaleTransactions;
