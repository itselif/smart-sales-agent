const StoreManager = require("./StoreManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  StorebycodenameRetrivedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbGetStorebycodename } = require("dbLayer");

class GetStoreByCodenameManager extends StoreManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getStoreByCodename",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: false,
      hasShareToken: false,
    });

    this.dataName = "store";

    this.readTenantId(request);

    if (this._storeId !== "d26f6763-ee90-4f97-bd8a-c69fabdb4780") {
      throw new ForbiddenError("errMsg_thisRouteIsOpenOnlyInSaasLevel");
    }
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.codename = this.codename;
  }

  readRestParameters(request) {
    this.codename = request.params?.codename;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.codename = request.mcpParams.codename;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.codename == null) {
      throw new BadRequestError("errMsg_codenameisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.store?.ownerId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetStorebycodename function to get the storebycodename and return the result to the controller
    const storebycodename = await dbGetStorebycodename(this);

    return storebycodename;
  }

  async raiseEvent() {
    StorebycodenameRetrivedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ codename: { $eq: this.codename } }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetStoreByCodenameManager;
