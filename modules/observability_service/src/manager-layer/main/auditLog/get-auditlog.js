const AuditLogManager = require("./AuditLogManager");
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
const { dbGetAuditlog } = require("dbLayer");

class GetAuditLogManager extends AuditLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getAuditLog",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "auditLog";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.auditLogId = this.auditLogId;
  }

  readRestParameters(request) {
    this.auditLogId = request.params?.auditLogId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.auditLogId = request.mcpParams.auditLogId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.auditLogId == null) {
      throw new BadRequestError("errMsg_auditLogIdisRequired");
    }

    // ID
    if (
      this.auditLogId &&
      !isValidObjectId(this.auditLogId) &&
      !isValidUUID(this.auditLogId)
    ) {
      throw new BadRequestError("errMsg_auditLogIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.auditLog?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetAuditlog function to get the auditlog and return the result to the controller
    const auditlog = await dbGetAuditlog(this);

    return auditlog;
  }

  async getRouteQuery() {
    return {
      $and: [
        { id: this.auditLogId },
        { storeId: this.storeId, isActive: true },
      ],
    };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetAuditLogManager;
