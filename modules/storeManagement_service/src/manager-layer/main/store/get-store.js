const StoreManager = require("./StoreManager");
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
const { dbGetStore } = require("dbLayer");

class GetStoreManager extends StoreManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getStore",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "store";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.storeId = this.storeId;
  }

  readRestParameters(request) {
    this.storeId = request.params?.storeId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.storeId = request.mcpParams.storeId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.storeId == null) {
      throw new BadRequestError("errMsg_storeIdisRequired");
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

    this.isOwner = this.store?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetStore function to get the store and return the result to the controller
    const store = await dbGetStore(this);

    return store;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.storeId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetStoreManager;
