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
const { dbCreateOpenapischema } = require("dbLayer");

class CreateOpenApiSchemaManager extends OpenApiSchemaManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createOpenApiSchema",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
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
    jsonObj.version = this.version;
    jsonObj.description = this.description;
    jsonObj.schemaJson = this.schemaJson;
  }

  readRestParameters(request) {
    this.version = request.body?.version;
    this.description = request.body?.description;
    this.schemaJson = request.body?.schemaJson;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.version = request.mcpParams.version;
    this.description = request.mcpParams.description;
    this.schemaJson = request.mcpParams.schemaJson;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.version == null) {
      throw new BadRequestError("errMsg_versionisRequired");
    }

    if (this.schemaJson == null) {
      throw new BadRequestError("errMsg_schemaJsonisRequired");
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
    // make an awaited call to the dbCreateOpenapischema function to create the openapischema and return the result to the controller
    const openapischema = await dbCreateOpenapischema(this);

    return openapischema;
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.openApiSchemaId = this.id;
    if (!this.openApiSchemaId) this.openApiSchemaId = newUUID(false);

    const dataClause = {
      id: this.openApiSchemaId,
      version: this.version,
      description: this.description,
      schemaJson: this.schemaJson,
    };

    return dataClause;
  }
}

module.exports = CreateOpenApiSchemaManager;
