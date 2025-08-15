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
const { dbCreateSaletransactionhistory } = require("dbLayer");

class CreateSaleTransactionHistoryManager extends SaleTransactionHistoryManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createSaleTransactionHistory",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "saleTransactionHistory";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.transactionId = this.transactionId;
    jsonObj.changeType = this.changeType;
    jsonObj.changedByUserId = this.changedByUserId;
    jsonObj.changeTimestamp = this.changeTimestamp;
    jsonObj.correctionJustification = this.correctionJustification;
    jsonObj.previousData = this.previousData;
    jsonObj.newData = this.newData;
  }

  readRestParameters(request) {
    this.transactionId = request.body?.transactionId;
    this.changeType = request.body?.changeType;
    this.changedByUserId = request.body?.changedByUserId;
    this.changeTimestamp = request.body?.changeTimestamp;
    this.correctionJustification = request.body?.correctionJustification;
    this.previousData = request.body?.previousData;
    this.newData = request.body?.newData;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.transactionId = request.mcpParams.transactionId;
    this.changeType = request.mcpParams.changeType;
    this.changedByUserId = request.mcpParams.changedByUserId;
    this.changeTimestamp = request.mcpParams.changeTimestamp;
    this.correctionJustification = request.mcpParams.correctionJustification;
    this.previousData = request.mcpParams.previousData;
    this.newData = request.mcpParams.newData;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.transactionId == null) {
      throw new BadRequestError("errMsg_transactionIdisRequired");
    }

    if (this.changeType == null) {
      throw new BadRequestError("errMsg_changeTypeisRequired");
    }

    if (this.changedByUserId == null) {
      throw new BadRequestError("errMsg_changedByUserIdisRequired");
    }

    if (this.changeTimestamp == null) {
      throw new BadRequestError("errMsg_changeTimestampisRequired");
    }

    if (this.previousData == null) {
      throw new BadRequestError("errMsg_previousDataisRequired");
    }

    // ID
    if (
      this.transactionId &&
      !isValidObjectId(this.transactionId) &&
      !isValidUUID(this.transactionId)
    ) {
      throw new BadRequestError("errMsg_transactionIdisNotAValidID");
    }

    // ID
    if (
      this.changedByUserId &&
      !isValidObjectId(this.changedByUserId) &&
      !isValidUUID(this.changedByUserId)
    ) {
      throw new BadRequestError("errMsg_changedByUserIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.saleTransactionHistory?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateSaletransactionhistory function to create the saletransactionhistory and return the result to the controller
    const saletransactionhistory = await dbCreateSaletransactionhistory(this);

    return saletransactionhistory;
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.saleTransactionHistoryId = this.id;
    if (!this.saleTransactionHistoryId)
      this.saleTransactionHistoryId = newUUID(false);

    const dataClause = {
      id: this.saleTransactionHistoryId,
      transactionId: this.transactionId,
      changeType: this.changeType,
      changedByUserId: this.changedByUserId,
      changeTimestamp: this.changeTimestamp,
      correctionJustification: this.correctionJustification,
      previousData: this.previousData
        ? typeof this.previousData == "string"
          ? JSON.parse(this.previousData)
          : this.previousData
        : null,
      newData: this.newData
        ? typeof this.newData == "string"
          ? JSON.parse(this.newData)
          : this.newData
        : null,
      storeId: this.storeId,
    };

    return dataClause;
  }
}

module.exports = CreateSaleTransactionHistoryManager;
