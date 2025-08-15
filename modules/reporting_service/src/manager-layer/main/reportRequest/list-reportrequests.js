const ReportRequestManager = require("./ReportRequestManager");
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
const { dbListReportrequests } = require("dbLayer");

class ListReportRequestsManager extends ReportRequestManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listReportRequests",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 30,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportRequests";

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

    this.isOwner =
      this.reportRequests?.requestedByUserId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbListReportrequests function to getList the reportrequests and return the result to the controller
    const reportrequests = await dbListReportrequests(this);

    return reportrequests;
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

module.exports = ListReportRequestsManager;
