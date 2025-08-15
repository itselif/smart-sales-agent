const StoreManager = require("./StoreManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  RegisteredstoresListedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbListRegisteredstores } = require("dbLayer");

class ListRegisteredStoresManager extends StoreManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listRegisteredStores",
      controllerType: controllerType,
      pagination: false,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "stores";

    this.sortBy = [["id", "ASC"]];

    this.readTenantId(request);

    if (this._storeId !== "d26f6763-ee90-4f97-bd8a-c69fabdb4780") {
      throw new ForbiddenError("errMsg_thisRouteIsOpenOnlyInSaasLevel");
    }
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }

  readRestParameters(request) {
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {}

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.stores?.ownerId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbListRegisteredstores function to getList the registeredstores and return the result to the controller
    const registeredstores = await dbListRegisteredstores(this);

    return registeredstores;
  }

  async raiseEvent() {
    RegisteredstoresListedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = ListRegisteredStoresManager;
