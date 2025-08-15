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
const { dbGetSaletransaction } = require("dbLayer");

class GetSaleTransactionManager extends SaleTransactionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getSaleTransaction",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "saleTransaction";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.saleTransactionId = this.saleTransactionId;
  }

  readRestParameters(request) {
    this.saleTransactionId = request.params?.saleTransactionId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.saleTransactionId = request.mcpParams.saleTransactionId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.saleTransactionId == null) {
      throw new BadRequestError("errMsg_saleTransactionIdisRequired");
    }

    // ID
    if (
      this.saleTransactionId &&
      !isValidObjectId(this.saleTransactionId) &&
      !isValidUUID(this.saleTransactionId)
    ) {
      throw new BadRequestError("errMsg_saleTransactionIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.saleTransaction?.sellerId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetSaletransaction function to get the saletransaction and return the result to the controller
    const saletransaction = await dbGetSaletransaction(this);

    return saletransaction;
  }

  async getRouteQuery() {
    return {
      $and: [
        { id: this.saleTransactionId },
        { storeId: this.storeId, isActive: true },
      ],
    };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetSaleTransactionManager;
