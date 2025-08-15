const { CreateSaleTransactionHistoryManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class CreateSaleTransactionHistoryRestController extends SalesManagementRestController {
  constructor(req, res) {
    super(
      "createSaleTransactionHistory",
      "createsaletransactionhistory",
      req,
      res,
    );
    this.dataName = "saleTransactionHistory";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateSaleTransactionHistoryManager(this._req, "rest");
  }
}

const createSaleTransactionHistory = async (req, res, next) => {
  const createSaleTransactionHistoryRestController =
    new CreateSaleTransactionHistoryRestController(req, res);
  try {
    await createSaleTransactionHistoryRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createSaleTransactionHistory;
