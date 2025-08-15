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
const { dbUpdateAuditlog } = require("dbLayer");

class UpdateAuditLogManager extends AuditLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateAuditLog",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "auditLog";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.auditLogId = this.auditLogId;
    jsonObj.message = this.message;
  }

  readRestParameters(request) {
    this.auditLogId = request.params?.auditLogId;
    this.message = request.body?.message;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.auditLogId = request.mcpParams.auditLogId;
    this.message = request.mcpParams.message;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getAuditLogById } = require("dbLayer");
    this.auditLog = await getAuditLogById(this.auditLogId);
    if (!this.auditLog) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

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
    // make an awaited call to the dbUpdateAuditlog function to update the auditlog and return the result to the controller
    const auditlog = await dbUpdateAuditlog(this);

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

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      message: this.message,
    };

    return dataClause;
  }
}

module.exports = UpdateAuditLogManager;
