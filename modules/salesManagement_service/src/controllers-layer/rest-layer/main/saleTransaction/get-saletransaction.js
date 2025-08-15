const { GetSaleTransactionManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class GetSaleTransactionRestController extends SalesManagementRestController {
  constructor(req, res) {
    super("getSaleTransaction", "getsaletransaction", req, res);
    this.dataName = "saleTransaction";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetSaleTransactionManager(this._req, "rest");
  }
}

const getSaleTransaction = async (req, res, next) => {
  const getSaleTransactionRestController = new GetSaleTransactionRestController(
    req,
    res,
  );
  try {
    await getSaleTransactionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getSaleTransaction;
