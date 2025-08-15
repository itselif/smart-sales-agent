const SaleTransactionHistoryManager = require("./SaleTransactionHistoryManager");
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
const { dbDeleteSaletransactionhistory } = require("dbLayer");

class DeleteSaleTransactionHistoryManager extends SaleTransactionHistoryManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteSaleTransactionHistory",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "saleTransactionHistory";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.saleTransactionHistoryId = this.saleTransactionHistoryId;
  }

  readRestParameters(request) {
    this.saleTransactionHistoryId = request.params?.saleTransactionHistoryId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.saleTransactionHistoryId = request.mcpParams.saleTransactionHistoryId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getSaleTransactionHistoryById } = require("dbLayer");
    this.saleTransactionHistory = await getSaleTransactionHistoryById(
      this.saleTransactionHistoryId,
    );
    if (!this.saleTransactionHistory) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.saleTransactionHistoryId == null) {
      throw new BadRequestError("errMsg_saleTransactionHistoryIdisRequired");
    }

    // ID
    if (
      this.saleTransactionHistoryId &&
      !isValidObjectId(this.saleTransactionHistoryId) &&
      !isValidUUID(this.saleTransactionHistoryId)
    ) {
      throw new BadRequestError("errMsg_saleTransactionHistoryIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.saleTransactionHistory?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbDeleteSaletransactionhistory function to delete the saletransactionhistory and return the result to the controller
    const saletransactionhistory = await dbDeleteSaletransactionhistory(this);

    return saletransactionhistory;
  }

  async getRouteQuery() {
    return {
      $and: [
        { id: this.saleTransactionHistoryId },
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

module.exports = DeleteSaleTransactionHistoryManager;
