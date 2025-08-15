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
const { dbGetReportpolicy } = require("dbLayer");

class GetReportPolicyManager extends ReportPolicyManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getReportPolicy",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportPolicy";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportPolicyId = this.reportPolicyId;
  }

  readRestParameters(request) {
    this.reportPolicyId = request.params?.reportPolicyId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportPolicyId = request.mcpParams.reportPolicyId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.reportPolicyId == null) {
      throw new BadRequestError("errMsg_reportPolicyIdisRequired");
    }

    // ID
    if (
      this.reportPolicyId &&
      !isValidObjectId(this.reportPolicyId) &&
      !isValidUUID(this.reportPolicyId)
    ) {
      throw new BadRequestError("errMsg_reportPolicyIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.reportPolicy?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetReportpolicy function to get the reportpolicy and return the result to the controller
    const reportpolicy = await dbGetReportpolicy(this);

    return reportpolicy;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.reportPolicyId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetReportPolicyManager;
