const { CreateSaleTransactionManager } = require("managers");

const SalesManagementRestController = require("../../SalesManagementServiceRestController");

class CreateSaleTransactionRestController extends SalesManagementRestController {
  constructor(req, res) {
    super("createSaleTransaction", "createsaletransaction", req, res);
    this.dataName = "saleTransaction";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateSaleTransactionManager(this._req, "rest");
  }
}

const createSaleTransaction = async (req, res, next) => {
  const createSaleTransactionRestController =
    new CreateSaleTransactionRestController(req, res);
  try {
    await createSaleTransactionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createSaleTransaction;
