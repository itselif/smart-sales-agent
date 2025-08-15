const ReportRequestManager = require("./ReportRequestManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  ReportrequestUpdatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateReportrequest } = require("dbLayer");

class UpdateReportRequestManager extends ReportRequestManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateReportRequest",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportRequest";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportRequestId = this.reportRequestId;
    jsonObj.status = this.status;
  }

  readRestParameters(request) {
    this.reportRequestId = request.params?.reportRequestId;
    this.status = request.body?.status;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportRequestId = request.mcpParams.reportRequestId;
    this.status = request.mcpParams.status;
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
    // make an awaited call to the dbUpdateReportrequest function to update the reportrequest and return the result to the controller
    const reportrequest = await dbUpdateReportrequest(this);

    return reportrequest;
  }

  async raiseEvent() {
    ReportrequestUpdatedPublisher.Publish(this.output, this.session).catch(
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

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      status: this.status,
    };

    return dataClause;
  }
}

module.exports = UpdateReportRequestManager;
