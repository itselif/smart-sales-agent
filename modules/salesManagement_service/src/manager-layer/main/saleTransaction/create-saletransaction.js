const SaleTransactionManager = require("./SaleTransactionManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  SaletransactionCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateSaletransaction } = require("dbLayer");

class CreateSaleTransactionManager extends SaleTransactionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createSaleTransaction",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "saleTransaction";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.sellerId = this.sellerId;
    jsonObj.amount = this.amount;
    jsonObj.currency = this.currency;
    jsonObj.transactionDate = this.transactionDate;
    jsonObj.status = this.status;
    jsonObj.correctionJustification = this.correctionJustification;
  }

  readRestParameters(request) {
    this.sellerId = request.session?.userId;
    this.amount = request.body?.amount;
    this.currency = request.body?.currency;
    this.transactionDate = request.body?.transactionDate;
    this.status = request.body?.status;
    this.correctionJustification = request.body?.correctionJustification;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.sellerId = request.session.userId;
    this.amount = request.mcpParams.amount;
    this.currency = request.mcpParams.currency;
    this.transactionDate = request.mcpParams.transactionDate;
    this.status = request.mcpParams.status;
    this.correctionJustification = request.mcpParams.correctionJustification;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.sellerId == null) {
      throw new BadRequestError("errMsg_sellerIdisRequired");
    }

    if (this.amount == null) {
      throw new BadRequestError("errMsg_amountisRequired");
    }

    if (this.currency == null) {
      throw new BadRequestError("errMsg_currencyisRequired");
    }

    if (this.transactionDate == null) {
      throw new BadRequestError("errMsg_transactionDateisRequired");
    }

    if (this.status == null) {
      throw new BadRequestError("errMsg_statusisRequired");
    }

    // ID
    if (
      this.sellerId &&
      !isValidObjectId(this.sellerId) &&
      !isValidUUID(this.sellerId)
    ) {
      throw new BadRequestError("errMsg_sellerIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.saleTransaction?.sellerId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateSaletransaction function to create the saletransaction and return the result to the controller
    const saletransaction = await dbCreateSaletransaction(this);

    return saletransaction;
  }

  async raiseEvent() {
    SaletransactionCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.saleTransactionId = this.id;
    if (!this.saleTransactionId) this.saleTransactionId = newUUID(false);

    const dataClause = {
      id: this.saleTransactionId,
      sellerId: this.sellerId,
      amount: this.amount,
      currency: this.currency,
      transactionDate: this.transactionDate,
      status: this.status,
      correctionJustification: this.correctionJustification,
      storeId: this.storeId,
    };

    return dataClause;
  }
}

module.exports = CreateSaleTransactionManager;
