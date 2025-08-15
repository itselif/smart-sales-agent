const InventoryMovementManager = require("./InventoryMovementManager");
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
const { dbGetInventorymovement } = require("dbLayer");

class GetInventoryMovementManager extends InventoryMovementManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getInventoryMovement",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "inventoryMovement";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inventoryMovementId = this.inventoryMovementId;
  }

  readRestParameters(request) {
    this.inventoryMovementId = request.params?.inventoryMovementId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inventoryMovementId = request.mcpParams.inventoryMovementId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.inventoryMovementId == null) {
      throw new BadRequestError("errMsg_inventoryMovementIdisRequired");
    }

    // ID
    if (
      this.inventoryMovementId &&
      !isValidObjectId(this.inventoryMovementId) &&
      !isValidUUID(this.inventoryMovementId)
    ) {
      throw new BadRequestError("errMsg_inventoryMovementIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inventoryMovement?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetInventorymovement function to get the inventorymovement and return the result to the controller
    const inventorymovement = await dbGetInventorymovement(this);

    return inventorymovement;
  }

  async getRouteQuery() {
    return {
      $and: [
        { id: this.inventoryMovementId },
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

module.exports = GetInventoryMovementManager;
