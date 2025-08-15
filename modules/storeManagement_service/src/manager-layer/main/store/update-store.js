const StoreManager = require("./StoreManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { StoreUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateStore } = require("dbLayer");

class UpdateStoreManager extends StoreManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateStore",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "store";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.storeId = this.storeId;
    jsonObj.name = this.name;
    jsonObj.fullname = this.fullname;
    jsonObj.city = this.city;
    jsonObj.avatar = this.avatar;
    jsonObj.active = this.active;
  }

  readRestParameters(request) {
    this.storeId = request.params?.storeId;
    this.name = request.body?.name;
    this.fullname = request.body?.fullname;
    this.city = request.body?.city;
    this.avatar = request.body?.avatar;
    this.active = request.body?.active;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.storeId = request.mcpParams.storeId;
    this.name = request.mcpParams.name;
    this.fullname = request.mcpParams.fullname;
    this.city = request.mcpParams.city;
    this.avatar = request.mcpParams.avatar;
    this.active = request.mcpParams.active;
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
    // make an awaited call to the dbUpdateStore function to update the store and return the result to the controller
    const store = await dbUpdateStore(this);

    return store;
  }

  async raiseEvent() {
    StoreUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
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

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      name: this.name,
      fullname: this.fullname,
      city: this.city,
      avatar: this.avatar,
      active: this.active,
    };

    return dataClause;
  }
}

module.exports = UpdateStoreManager;
