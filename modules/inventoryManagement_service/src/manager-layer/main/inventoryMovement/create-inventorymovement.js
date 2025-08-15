const InventoryMovementManager = require("./InventoryMovementManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  InventorymovementCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateInventorymovement } = require("dbLayer");

class CreateInventoryMovementManager extends InventoryMovementManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createInventoryMovement",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "inventoryMovement";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inventoryItemId = this.inventoryItemId;
    jsonObj.quantityDelta = this.quantityDelta;
    jsonObj.movementType = this.movementType;
    jsonObj.movementTimestamp = this.movementTimestamp;
    jsonObj.userId = this.userId;
    jsonObj.movementReason = this.movementReason;
  }

  readRestParameters(request) {
    this.inventoryItemId = request.body?.inventoryItemId;
    this.quantityDelta = request.body?.quantityDelta;
    this.movementType = request.body?.movementType;
    this.movementTimestamp = request.body?.movementTimestamp;
    this.userId = request.body?.userId;
    this.movementReason = request.body?.movementReason;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.inventoryItemId = request.mcpParams.inventoryItemId;
    this.quantityDelta = request.mcpParams.quantityDelta;
    this.movementType = request.mcpParams.movementType;
    this.movementTimestamp = request.mcpParams.movementTimestamp;
    this.userId = request.mcpParams.userId;
    this.movementReason = request.mcpParams.movementReason;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.inventoryItemId == null) {
      throw new BadRequestError("errMsg_inventoryItemIdisRequired");
    }

    if (this.quantityDelta == null) {
      throw new BadRequestError("errMsg_quantityDeltaisRequired");
    }

    if (this.movementType == null) {
      throw new BadRequestError("errMsg_movementTypeisRequired");
    }

    if (this.movementTimestamp == null) {
      throw new BadRequestError("errMsg_movementTimestampisRequired");
    }

    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
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
      this.userId &&
      !isValidObjectId(this.userId) &&
      !isValidUUID(this.userId)
    ) {
      throw new BadRequestError("errMsg_userIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inventoryMovement?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateInventorymovement function to create the inventorymovement and return the result to the controller
    const inventorymovement = await dbCreateInventorymovement(this);

    return inventorymovement;
  }

  async raiseEvent() {
    InventorymovementCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.inventoryMovementId = this.id;
    if (!this.inventoryMovementId) this.inventoryMovementId = newUUID(false);

    const dataClause = {
      id: this.inventoryMovementId,
      inventoryItemId: this.inventoryItemId,
      quantityDelta: this.quantityDelta,
      movementType: this.movementType,
      movementTimestamp: this.movementTimestamp,
      userId: this.userId,
      movementReason: this.movementReason,
      storeId: this.storeId,
    };

    return dataClause;
  }
}

module.exports = CreateInventoryMovementManager;
