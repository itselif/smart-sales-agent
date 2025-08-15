const InventoryMovementManager = require("./InventoryMovementManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  InventorymovementDeletedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteInventorymovement } = require("dbLayer");

class DeleteInventoryMovementManager extends InventoryMovementManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteInventoryMovement",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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

  async fetchInstance() {
    const { getInventoryMovementById } = require("dbLayer");
    this.inventoryMovement = await getInventoryMovementById(
      this.inventoryMovementId,
    );
    if (!this.inventoryMovement) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

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
    // make an awaited call to the dbDeleteInventorymovement function to delete the inventorymovement and return the result to the controller
    const inventorymovement = await dbDeleteInventorymovement(this);

    return inventorymovement;
  }

  async raiseEvent() {
    InventorymovementDeletedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
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

module.exports = DeleteInventoryMovementManager;
