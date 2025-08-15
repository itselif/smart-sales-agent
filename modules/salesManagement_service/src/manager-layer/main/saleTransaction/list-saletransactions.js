const SaleTransactionManager = require("./SaleTransactionManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbListSaletransactions } = require("dbLayer");

class ListSaleTransactionsManager extends SaleTransactionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listSaleTransactions",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 50,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "saleTransactions";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }

  readRestParameters(request) {
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {}

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.saleTransactions?.sellerId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbListSaletransactions function to getList the saletransactions and return the result to the controller
    const saletransactions = await dbListSaletransactions(this);

    return saletransactions;
  }

  async getRouteQuery() {
    return { $and: [{ storeId: this.storeId, isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = ListSaleTransactionsManager;
