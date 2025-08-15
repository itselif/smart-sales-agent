const LowStockAlertManager = require("./LowStockAlertManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  LowstockalertCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateLowstockalert } = require("dbLayer");

class CreateLowStockAlertManager extends LowStockAlertManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createLowStockAlert",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "lowStockAlert";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inventoryItemId = this.inventoryItemId;
    jsonObj.alertType = this.alertType;
    jsonObj.alertTimestamp = this.alertTimestamp;
    jsonObj.resolved = this.resolved;
    jsonObj.resolvedByUserId = this.resolvedByUserId;
    jsonObj.resolvedTimestamp = this.resolvedTimestamp;
  }

  readRestParameters(request) {
    this.inventoryItemId = request.body?.inventoryItemId;
    this.alertType = request.body?.alertType;
    this.alertTimestamp = request.body?.alertTimestamp;
    this.resolved = request.body?.resolved;
    this.resolvedByUserId = request.body?.resolvedByUserId;
    this.resolvedTimestamp = request.body?.resolvedTimestamp;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inventoryItemId = request.mcpParams.inventoryItemId;
    this.alertType = request.mcpParams.alertType;
    this.alertTimestamp = request.mcpParams.alertTimestamp;
    this.resolved = request.mcpParams.resolved;
    this.resolvedByUserId = request.mcpParams.resolvedByUserId;
    this.resolvedTimestamp = request.mcpParams.resolvedTimestamp;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.inventoryItemId == null) {
      throw new BadRequestError("errMsg_inventoryItemIdisRequired");
    }

    if (this.alertType == null) {
      throw new BadRequestError("errMsg_alertTypeisRequired");
    }

    if (this.alertTimestamp == null) {
      throw new BadRequestError("errMsg_alertTimestampisRequired");
    }

    // ID
    if (
      this.inventoryItemId &&
      !isValidObjectId(this.inventoryItemId) &&
      !isValidUUID(this.inventoryItemId)
    ) {
      throw new BadRequestError("errMsg_inventoryItemIdisNotAValidID");
    }

    // ID
    if (
      this.resolvedByUserId &&
      !isValidObjectId(this.resolvedByUserId) &&
      !isValidUUID(this.resolvedByUserId)
    ) {
      throw new BadRequestError("errMsg_resolvedByUserIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.lowStockAlert?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateLowstockalert function to create the lowstockalert and return the result to the controller
    const lowstockalert = await dbCreateLowstockalert(this);

    return lowstockalert;
  }

  async raiseEvent() {
    LowstockalertCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.lowStockAlertId = this.id;
    if (!this.lowStockAlertId) this.lowStockAlertId = newUUID(false);

    const dataClause = {
      id: this.lowStockAlertId,
      inventoryItemId: this.inventoryItemId,
      alertType: this.alertType,
      alertTimestamp: this.alertTimestamp,
      resolved: this.resolved,
      resolvedByUserId: this.resolvedByUserId,
      resolvedTimestamp: this.resolvedTimestamp,
      storeId: this.storeId,
    };

    return dataClause;
  }
}

module.exports = CreateLowStockAlertManager;
