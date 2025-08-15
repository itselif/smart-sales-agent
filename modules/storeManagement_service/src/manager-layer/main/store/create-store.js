const StoreManager = require("./StoreManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { StoreCreatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateStore } = require("dbLayer");

class CreateStoreManager extends StoreManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createStore",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "store";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.name = this.name;
    jsonObj.fullname = this.fullname;
    jsonObj.city = this.city;
    jsonObj.avatar = this.avatar;
    jsonObj.active = this.active;
  }

  readRestParameters(request) {
    this.name = request.body?.name;
    this.fullname = request.body?.fullname;
    this.city = request.body?.city;
    this.avatar = request.body?.avatar;
    this.active = request.body?.active;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.name = request.mcpParams.name;
    this.fullname = request.mcpParams.fullname;
    this.city = request.mcpParams.city;
    this.avatar = request.mcpParams.avatar;
    this.active = request.mcpParams.active;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.name == null) {
      throw new BadRequestError("errMsg_nameisRequired");
    }

    if (this.active == null) {
      throw new BadRequestError("errMsg_activeisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.store?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateStore function to create the store and return the result to the controller
    const store = await dbCreateStore(this);

    return store;
  }

  async raiseEvent() {
    StoreCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.storeId = this.id;
    if (!this.storeId) this.storeId = newUUID(false);

    const dataClause = {
      id: this.storeId,
      name: this.name,
      fullname: this.fullname,
      city: this.city,
      avatar: this.avatar,
      active: this.active,
    };

    return dataClause;
  }
}

module.exports = CreateStoreManager;
