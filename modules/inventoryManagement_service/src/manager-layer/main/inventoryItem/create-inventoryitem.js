const InventoryItemManager = require("./InventoryItemManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  InventoryitemCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateInventoryitem } = require("dbLayer");

class CreateInventoryItemManager extends InventoryItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createInventoryItem",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "inventoryItem";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.productId = this.productId;
    jsonObj.quantity = this.quantity;
    jsonObj.status = this.status;
    jsonObj.lowStockThreshold = this.lowStockThreshold;
    jsonObj.lastSyncTimestamp = this.lastSyncTimestamp;
  }

  readRestParameters(request) {
    this.productId = request.body?.productId;
    this.quantity = request.body?.quantity;
    this.status = request.body?.status;
    this.lowStockThreshold = request.body?.lowStockThreshold;
    this.lastSyncTimestamp = request.body?.lastSyncTimestamp;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.productId = request.mcpParams.productId;
    this.quantity = request.mcpParams.quantity;
    this.status = request.mcpParams.status;
    this.lowStockThreshold = request.mcpParams.lowStockThreshold;
    this.lastSyncTimestamp = request.mcpParams.lastSyncTimestamp;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.productId == null) {
      throw new BadRequestError("errMsg_productIdisRequired");
    }

    if (this.quantity == null) {
      throw new BadRequestError("errMsg_quantityisRequired");
    }

    if (this.status == null) {
      throw new BadRequestError("errMsg_statusisRequired");
    }

    if (this.lowStockThreshold == null) {
      throw new BadRequestError("errMsg_lowStockThresholdisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inventoryItem?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateInventoryitem function to create the inventoryitem and return the result to the controller
    const inventoryitem = await dbCreateInventoryitem(this);

    return inventoryitem;
  }

  async raiseEvent() {
    InventoryitemCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.inventoryItemId = this.id;
    if (!this.inventoryItemId) this.inventoryItemId = newUUID(false);

    const dataClause = {
      id: this.inventoryItemId,
      productId: this.productId,
      quantity: this.quantity,
      status: this.status,
      lowStockThreshold: this.lowStockThreshold,
      lastSyncTimestamp: this.lastSyncTimestamp,
      storeId: this.storeId,
    };

    return dataClause;
  }
}

module.exports = CreateInventoryItemManager;
