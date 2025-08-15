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
const { dbDeleteOpenapischema } = require("dbLayer");

class DeleteOpenApiSchemaManager extends OpenApiSchemaManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteOpenApiSchema",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "openApiSchema";

    this.readTenantId(request);

    if (this._storeId !== "d26f6763-ee90-4f97-bd8a-c69fabdb4780") {
      throw new ForbiddenError("errMsg_thisRouteIsOpenOnlyInSaasLevel");
    }
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.openApiSchemaId = this.openApiSchemaId;
  }

  readRestParameters(request) {
    this.openApiSchemaId = request.params?.openApiSchemaId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.openApiSchemaId = request.mcpParams.openApiSchemaId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getOpenApiSchemaById } = require("dbLayer");
    this.openApiSchema = await getOpenApiSchemaById(this.openApiSchemaId);
    if (!this.openApiSchema) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.openApiSchemaId == null) {
      throw new BadRequestError("errMsg_openApiSchemaIdisRequired");
    }

    // ID
    if (
      this.openApiSchemaId &&
      !isValidObjectId(this.openApiSchemaId) &&
      !isValidUUID(this.openApiSchemaId)
    ) {
      throw new BadRequestError("errMsg_openApiSchemaIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.openApiSchema?._owner === this.session.userId;
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
    // make an awaited call to the dbDeleteOpenapischema function to delete the openapischema and return the result to the controller
    const openapischema = await dbDeleteOpenapischema(this);

    return openapischema;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.openApiSchemaId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = DeleteOpenApiSchemaManager;
