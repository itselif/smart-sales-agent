const OpenApiSchemaManager = require("./OpenApiSchemaManager");
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
const { dbListOpenapischemas } = require("dbLayer");

class ListOpenApiSchemasManager extends OpenApiSchemaManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listOpenApiSchemas",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "openApiSchemas";

    this.sortBy = [["createdAt", "DESC"]];

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

    this.isOwner = this.openApiSchemas?._owner === this.session.userId;
  }

  checkAbsolute() {
    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole(this.ROLES.admin)) {
      this.absoluteAuth = true;
      return true;
    }
    return false;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbListOpenapischemas function to getList the openapischemas and return the result to the controller
    const openapischemas = await dbListOpenapischemas(this);

    return openapischemas;
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

module.exports = ListOpenApiSchemasManager;
