const StoreAssignmentManager = require("./StoreAssignmentManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  StoreassignmentCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateStoreassignment } = require("dbLayer");

class CreateStoreAssignmentManager extends StoreAssignmentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createStoreAssignment",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "storeAssignment";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.storeId = this.storeId;
    jsonObj.role = this.role;
    jsonObj.assignmentType = this.assignmentType;
    jsonObj.status = this.status;
    jsonObj.overrideJustification = this.overrideJustification;
    jsonObj.validFrom = this.validFrom;
    jsonObj.validUntil = this.validUntil;
  }

  readRestParameters(request) {
    this.userId = request.body?.userId;
    this.storeId = request.body?.storeId;
    this.role = request.body?.role;
    this.assignmentType = request.body?.assignmentType;
    this.status = request.body?.status;
    this.overrideJustification = request.body?.overrideJustification;
    this.validFrom = request.body?.validFrom;
    this.validUntil = request.body?.validUntil;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams.userId;
    this.storeId = request.mcpParams.storeId;
    this.role = request.mcpParams.role;
    this.assignmentType = request.mcpParams.assignmentType;
    this.status = request.mcpParams.status;
    this.overrideJustification = request.mcpParams.overrideJustification;
    this.validFrom = request.mcpParams.validFrom;
    this.validUntil = request.mcpParams.validUntil;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

    if (this.storeId == null) {
      throw new BadRequestError("errMsg_storeIdisRequired");
    }

    if (this.role == null) {
      throw new BadRequestError("errMsg_roleisRequired");
    }

    if (this.assignmentType == null) {
      throw new BadRequestError("errMsg_assignmentTypeisRequired");
    }

    if (this.status == null) {
      throw new BadRequestError("errMsg_statusisRequired");
    }

    // ID
    if (
      this.userId &&
      !isValidObjectId(this.userId) &&
      !isValidUUID(this.userId)
    ) {
      throw new BadRequestError("errMsg_userIdisNotAValidID");
    }

    // ID
    if (
      this.storeId &&
      !isValidObjectId(this.storeId) &&
      !isValidUUID(this.storeId)
    ) {
      throw new BadRequestError("errMsg_storeIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.storeAssignment?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateStoreassignment function to create the storeassignment and return the result to the controller
    const storeassignment = await dbCreateStoreassignment(this);

    return storeassignment;
  }

  async raiseEvent() {
    StoreassignmentCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.storeAssignmentId = this.id;
    if (!this.storeAssignmentId) this.storeAssignmentId = newUUID(false);

    const dataClause = {
      id: this.storeAssignmentId,
      userId: this.userId,
      storeId: this.storeId,
      role: this.role,
      assignmentType: this.assignmentType,
      status: this.status,
      overrideJustification: this.overrideJustification,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
    };

    return dataClause;
  }
}

module.exports = CreateStoreAssignmentManager;
