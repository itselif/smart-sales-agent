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
const { dbListAuditlogs } = require("dbLayer");

class ListAuditLogsManager extends AuditLogManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listAuditLogs",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 50,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "auditLogs";

    this.readTenantId(request);
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

    this.isOwner = this.auditLogs?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbListAuditlogs function to getList the auditlogs and return the result to the controller
    const auditlogs = await dbListAuditlogs(this);

    return auditlogs;
  }

  async getRouteQuery() {
    return { $and: [{ storeId: this.storeId, isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = ListAuditLogsManager;
