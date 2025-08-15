const StoreManager = require("./StoreManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { StoreDeletedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteStore } = require("dbLayer");

class DeleteStoreManager extends StoreManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteStore",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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

  async fetchInstance() {
    const { getStoreById } = require("dbLayer");
    this.store = await getStoreById(this.storeId);
    if (!this.store) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

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
    // make an awaited call to the dbDeleteStore function to delete the store and return the result to the controller
    const store = await dbDeleteStore(this);

    return store;
  }

  async raiseEvent() {
    StoreDeletedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
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

module.exports = DeleteStoreManager;
