const InventoryItemManager = require("./InventoryItemManager");
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
const { dbGetInventoryitem } = require("dbLayer");

class GetInventoryItemManager extends InventoryItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getInventoryItem",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "inventoryItem";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inventoryItemId = this.inventoryItemId;
  }

  readRestParameters(request) {
    this.inventoryItemId = request.params?.inventoryItemId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inventoryItemId = request.mcpParams.inventoryItemId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

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
    // make an awaited call to the dbGetInventoryitem function to get the inventoryitem and return the result to the controller
    const inventoryitem = await dbGetInventoryitem(this);

    return inventoryitem;
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
}

module.exports = GetInventoryItemManager;
