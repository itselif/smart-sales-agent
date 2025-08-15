const ReportPolicyManager = require("./ReportPolicyManager");
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
const { dbListReportpolicies } = require("dbLayer");

class ListReportPoliciesManager extends ReportPolicyManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listReportPolicies",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 30,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportPolicies";

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

    this.isOwner = this.reportPolicies?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbListReportpolicies function to getList the reportpolicies and return the result to the controller
    const reportpolicies = await dbListReportpolicies(this);

    return reportpolicies;
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

module.exports = ListReportPoliciesManager;
