const ReportPolicyManager = require("./ReportPolicyManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  ReportpolicyDeletedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteReportpolicy } = require("dbLayer");

class DeleteReportPolicyManager extends ReportPolicyManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteReportPolicy",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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

  async fetchInstance() {
    const { getReportPolicyById } = require("dbLayer");
    this.reportPolicy = await getReportPolicyById(this.reportPolicyId);
    if (!this.reportPolicy) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

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
    // make an awaited call to the dbDeleteReportpolicy function to delete the reportpolicy and return the result to the controller
    const reportpolicy = await dbDeleteReportpolicy(this);

    return reportpolicy;
  }

  async raiseEvent() {
    ReportpolicyDeletedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
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

module.exports = DeleteReportPolicyManager;
