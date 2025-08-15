const StoreAssignmentManager = require("./StoreAssignmentManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  StoreassignmentDeletedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteStoreassignment } = require("dbLayer");

class DeleteStoreAssignmentManager extends StoreAssignmentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteStoreAssignment",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "storeAssignment";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.storeAssignmentId = this.storeAssignmentId;
  }

  readRestParameters(request) {
    this.storeAssignmentId = request.params?.storeAssignmentId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.storeAssignmentId = request.mcpParams.storeAssignmentId;
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
    // make an awaited call to the dbDeleteStoreassignment function to delete the storeassignment and return the result to the controller
    const storeassignment = await dbDeleteStoreassignment(this);

    return storeassignment;
  }

  async raiseEvent() {
    StoreassignmentDeletedPublisher.Publish(this.output, this.session).catch(
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
}

module.exports = DeleteStoreAssignmentManager;
