const StoreAssignmentManager = require("./StoreAssignmentManager");
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
const { dbGetStoreassignment } = require("dbLayer");

class GetStoreAssignmentManager extends StoreAssignmentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getStoreAssignment",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
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
    // make an awaited call to the dbGetStoreassignment function to get the storeassignment and return the result to the controller
    const storeassignment = await dbGetStoreassignment(this);

    return storeassignment;
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

module.exports = GetStoreAssignmentManager;
