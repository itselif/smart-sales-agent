const SaleTransactionManager = require("./SaleTransactionManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  SaletransactionUpdatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateSaletransaction } = require("dbLayer");

class UpdateSaleTransactionManager extends SaleTransactionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateSaleTransaction",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "saleTransaction";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.saleTransactionId = this.saleTransactionId;
    jsonObj.amount = this.amount;
    jsonObj.currency = this.currency;
    jsonObj.status = this.status;
    jsonObj.correctionJustification = this.correctionJustification;
  }

  readRestParameters(request) {
    this.saleTransactionId = request.params?.saleTransactionId;
    this.amount = request.body?.amount;
    this.currency = request.body?.currency;
    this.status = request.body?.status;
    this.correctionJustification = request.body?.correctionJustification;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.saleTransactionId = request.mcpParams.saleTransactionId;
    this.amount = request.mcpParams.amount;
    this.currency = request.mcpParams.currency;
    this.status = request.mcpParams.status;
    this.correctionJustification = request.mcpParams.correctionJustification;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getSaleTransactionById } = require("dbLayer");
    this.saleTransaction = await getSaleTransactionById(this.saleTransactionId);
    if (!this.saleTransaction) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

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
    // make an awaited call to the dbUpdateSaletransaction function to update the saletransaction and return the result to the controller
    const saletransaction = await dbUpdateSaletransaction(this);

    return saletransaction;
  }

  async raiseEvent() {
    SaletransactionUpdatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
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

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      correctionJustification: this.correctionJustification,
    };

    return dataClause;
  }

  async executeAggregatedCruds() {
    this.addCorrectionToHistory =
      await this.executeAggregatedCrudAddCorrectionToHistory();
  }

  async executeAggregatedCrudAddCorrectionToHistory() {
    // Aggregated Create Operation on SaleTransactionHistory
    const { createSaleTransactionHistory } = require("dbLayer");
    const params = {
      transactionId: this.saleTransaction.id,
      changeType: "correction",
      changedByUserId: this.session.userId,
      changeTimestamp: LIB.getCurrentTimestamp(),
      previousData: this.saleTransaction,
      newData: this.updateDataClause,
      correctionJustification: this.input.correctionJustification,
    };
    return await createSaleTransactionHistory(params);
  }
}

module.exports = UpdateSaleTransactionManager;
