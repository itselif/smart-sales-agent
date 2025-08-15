const ReportRequestManager = require("./ReportRequestManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  ReportrequestDeletedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteReportrequest } = require("dbLayer");

class DeleteReportRequestManager extends ReportRequestManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteReportRequest",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportRequest";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportRequestId = this.reportRequestId;
  }

  readRestParameters(request) {
    this.reportRequestId = request.params?.reportRequestId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportRequestId = request.mcpParams.reportRequestId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getReportRequestById } = require("dbLayer");
    this.reportRequest = await getReportRequestById(this.reportRequestId);
    if (!this.reportRequest) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.reportRequestId == null) {
      throw new BadRequestError("errMsg_reportRequestIdisRequired");
    }

    // ID
    if (
      this.reportRequestId &&
      !isValidObjectId(this.reportRequestId) &&
      !isValidUUID(this.reportRequestId)
    ) {
      throw new BadRequestError("errMsg_reportRequestIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner =
      this.reportRequest?.requestedByUserId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbDeleteReportrequest function to delete the reportrequest and return the result to the controller
    const reportrequest = await dbDeleteReportrequest(this);

    return reportrequest;
  }

  async raiseEvent() {
    ReportrequestDeletedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ id: this.reportRequestId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = DeleteReportRequestManager;
