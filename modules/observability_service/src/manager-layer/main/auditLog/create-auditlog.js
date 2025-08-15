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
const { dbCreateAuditlog } = require("dbLayer");

class CreateAuditLogManager extends AuditLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createAuditLog",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "auditLog";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.actionType = this.actionType;
    jsonObj.entityType = this.entityType;
    jsonObj.entityId = this.entityId;
    jsonObj.beforeData = this.beforeData;
    jsonObj.afterData = this.afterData;
    jsonObj.severity = this.severity;
    jsonObj.message = this.message;
    jsonObj.traceContext = this.traceContext;
  }

  readRestParameters(request) {
    this.userId = request.body?.userId;
    this.actionType = request.body?.actionType;
    this.entityType = request.body?.entityType;
    this.entityId = request.body?.entityId;
    this.beforeData = request.body?.beforeData;
    this.afterData = request.body?.afterData;
    this.severity = request.body?.severity;
    this.message = request.body?.message;
    this.traceContext = request.body?.traceContext;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams.userId;
    this.actionType = request.mcpParams.actionType;
    this.entityType = request.mcpParams.entityType;
    this.entityId = request.mcpParams.entityId;
    this.beforeData = request.mcpParams.beforeData;
    this.afterData = request.mcpParams.afterData;
    this.severity = request.mcpParams.severity;
    this.message = request.mcpParams.message;
    this.traceContext = request.mcpParams.traceContext;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

    if (this.actionType == null) {
      throw new BadRequestError("errMsg_actionTypeisRequired");
    }

    if (this.severity == null) {
      throw new BadRequestError("errMsg_severityisRequired");
    }

    // ID
    if (
      this.userId &&
      !isValidObjectId(this.userId) &&
      !isValidUUID(this.userId)
    ) {
      throw new BadRequestError("errMsg_userIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.auditLog?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateAuditlog function to create the auditlog and return the result to the controller
    const auditlog = await dbCreateAuditlog(this);

    return auditlog;
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.auditLogId = this.id;
    if (!this.auditLogId) this.auditLogId = newUUID(false);

    const dataClause = {
      id: this.auditLogId,
      userId: this.userId,
      actionType: this.actionType,
      entityType: this.entityType,
      entityId: this.entityId,
      beforeData: this.beforeData
        ? typeof this.beforeData == "string"
          ? JSON.parse(this.beforeData)
          : this.beforeData
        : null,
      afterData: this.afterData
        ? typeof this.afterData == "string"
          ? JSON.parse(this.afterData)
          : this.afterData
        : null,
      severity: this.severity,
      message: this.message,
      traceContext: this.traceContext
        ? typeof this.traceContext == "string"
          ? JSON.parse(this.traceContext)
          : this.traceContext
        : null,
      storeId: this.storeId,
    };

    return dataClause;
  }
}

module.exports = CreateAuditLogManager;
