const StoreAssignmentManager = require("./StoreAssignmentManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  StoreassignmentUpdatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateStoreassignment } = require("dbLayer");

class UpdateStoreAssignmentManager extends StoreAssignmentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateStoreAssignment",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "storeAssignment";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.storeAssignmentId = this.storeAssignmentId;
    jsonObj.assignmentType = this.assignmentType;
    jsonObj.status = this.status;
    jsonObj.overrideJustification = this.overrideJustification;
    jsonObj.validFrom = this.validFrom;
    jsonObj.validUntil = this.validUntil;
  }

  readRestParameters(request) {
    this.storeAssignmentId = request.params?.storeAssignmentId;
    this.assignmentType = request.body?.assignmentType;
    this.status = request.body?.status;
    this.overrideJustification = request.body?.overrideJustification;
    this.validFrom = request.body?.validFrom;
    this.validUntil = request.body?.validUntil;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.storeAssignmentId = request.mcpParams.storeAssignmentId;
    this.assignmentType = request.mcpParams.assignmentType;
    this.status = request.mcpParams.status;
    this.overrideJustification = request.mcpParams.overrideJustification;
    this.validFrom = request.mcpParams.validFrom;
    this.validUntil = request.mcpParams.validUntil;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getStoreAssignmentById } = require("dbLayer");
    this.storeAssignment = await getStoreAssignmentById(this.storeAssignmentId);
    if (!this.storeAssignment) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.storeAssignmentId == null) {
      throw new BadRequestError("errMsg_storeAssignmentIdisRequired");
    }

    // ID
    if (
      this.storeAssignmentId &&
      !isValidObjectId(this.storeAssignmentId) &&
      !isValidUUID(this.storeAssignmentId)
    ) {
      throw new BadRequestError("errMsg_storeAssignmentIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.storeAssignment?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateStoreassignment function to update the storeassignment and return the result to the controller
    const storeassignment = await dbUpdateStoreassignment(this);

    return storeassignment;
  }

  async raiseEvent() {
    StoreassignmentUpdatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ id: this.storeAssignmentId }, { isActive: true }] };

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
      assignmentType: this.assignmentType,
      status: this.status,
      overrideJustification: this.overrideJustification,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
    };

    return dataClause;
  }
}

module.exports = UpdateStoreAssignmentManager;
