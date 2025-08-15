const ReportRequestManager = require("./ReportRequestManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  ReportrequestCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateReportrequest } = require("dbLayer");

class CreateReportRequestManager extends ReportRequestManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createReportRequest",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportRequest";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.requestedByUserId = this.requestedByUserId;
    jsonObj.reportType = this.reportType;
    jsonObj.storeIds = this.storeIds;
    jsonObj.dateFrom = this.dateFrom;
    jsonObj.dateTo = this.dateTo;
    jsonObj.productIds = this.productIds;
    jsonObj.format = this.format;
    jsonObj.status = this.status;
  }

  readRestParameters(request) {
    this.requestedByUserId = request.session?.userId;
    this.reportType = request.body?.reportType;
    this.storeIds = request.body?.storeIds;
    this.dateFrom = request.body?.dateFrom;
    this.dateTo = request.body?.dateTo;
    this.productIds = request.body?.productIds;
    this.format = request.body?.format;
    this.status = request.body?.status;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.requestedByUserId = request.session.userId;
    this.reportType = request.mcpParams.reportType;
    this.storeIds = request.mcpParams.storeIds;
    this.dateFrom = request.mcpParams.dateFrom;
    this.dateTo = request.mcpParams.dateTo;
    this.productIds = request.mcpParams.productIds;
    this.format = request.mcpParams.format;
    this.status = request.mcpParams.status;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.requestedByUserId == null) {
      throw new BadRequestError("errMsg_requestedByUserIdisRequired");
    }

    if (this.reportType == null) {
      throw new BadRequestError("errMsg_reportTypeisRequired");
    }

    if (this.storeIds == null) {
      throw new BadRequestError("errMsg_storeIdsisRequired");
    }

    if (this.dateFrom == null) {
      throw new BadRequestError("errMsg_dateFromisRequired");
    }

    if (this.dateTo == null) {
      throw new BadRequestError("errMsg_dateToisRequired");
    }

    if (this.format == null) {
      throw new BadRequestError("errMsg_formatisRequired");
    }

    if (this.status == null) {
      throw new BadRequestError("errMsg_statusisRequired");
    }

    // ID
    if (
      this.requestedByUserId &&
      !isValidObjectId(this.requestedByUserId) &&
      !isValidUUID(this.requestedByUserId)
    ) {
      throw new BadRequestError("errMsg_requestedByUserIdisNotAValidID");
    }

    // ID
    if (
      this.storeIds &&
      !isValidObjectId(this.storeIds) &&
      !isValidUUID(this.storeIds)
    ) {
      throw new BadRequestError("errMsg_storeIdsisNotAValidID");
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
    // make an awaited call to the dbCreateReportrequest function to create the reportrequest and return the result to the controller
    const reportrequest = await dbCreateReportrequest(this);

    return reportrequest;
  }

  async raiseEvent() {
    ReportrequestCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.reportRequestId = this.id;
    if (!this.reportRequestId) this.reportRequestId = newUUID(false);

    const dataClause = {
      id: this.reportRequestId,
      requestedByUserId: this.requestedByUserId,
      reportType: this.reportType,
      storeIds: this.storeIds,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      productIds: this.productIds,
      format: this.format,
      status: this.status,
    };

    return dataClause;
  }
}

module.exports = CreateReportRequestManager;
