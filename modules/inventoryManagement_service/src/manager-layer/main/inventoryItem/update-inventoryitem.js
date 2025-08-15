const InventoryItemManager = require("./InventoryItemManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  InventoryitemUpdatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateInventoryitem } = require("dbLayer");

class UpdateInventoryItemManager extends InventoryItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateInventoryItem",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "inventoryItem";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inventoryItemId = this.inventoryItemId;
    jsonObj.quantity = this.quantity;
    jsonObj.status = this.status;
    jsonObj.lowStockThreshold = this.lowStockThreshold;
    jsonObj.lastSyncTimestamp = this.lastSyncTimestamp;
  }

  readRestParameters(request) {
    this.inventoryItemId = request.params?.inventoryItemId;
    this.quantity = request.body?.quantity;
    this.status = request.body?.status;
    this.lowStockThreshold = request.body?.lowStockThreshold;
    this.lastSyncTimestamp = request.body?.lastSyncTimestamp;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inventoryItemId = request.mcpParams.inventoryItemId;
    this.quantity = request.mcpParams.quantity;
    this.status = request.mcpParams.status;
    this.lowStockThreshold = request.mcpParams.lowStockThreshold;
    this.lastSyncTimestamp = request.mcpParams.lastSyncTimestamp;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getInventoryItemById } = require("dbLayer");
    this.inventoryItem = await getInventoryItemById(this.inventoryItemId);
    if (!this.inventoryItem) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.inventoryItemId == null) {
      throw new BadRequestError("errMsg_inventoryItemIdisRequired");
    }

    // ID
    if (
      this.inventoryItemId &&
      !isValidObjectId(this.inventoryItemId) &&
      !isValidUUID(this.inventoryItemId)
    ) {
      throw new BadRequestError("errMsg_inventoryItemIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inventoryItem?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateInventoryitem function to update the inventoryitem and return the result to the controller
    const inventoryitem = await dbUpdateInventoryitem(this);

    return inventoryitem;
  }

  async raiseEvent() {
    InventoryitemUpdatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return {
      $and: [
        { id: this.inventoryItemId },
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
      quantity: this.quantity,
      status: this.status,
      lowStockThreshold: this.lowStockThreshold,
      lastSyncTimestamp: this.lastSyncTimestamp,
    };

    return dataClause;
  }
}

module.exports = UpdateInventoryItemManager;
