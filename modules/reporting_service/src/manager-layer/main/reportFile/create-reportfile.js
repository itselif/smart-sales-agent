const ReportFileManager = require("./ReportFileManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { ReportfileCreatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateReportfile } = require("dbLayer");

class CreateReportFileManager extends ReportFileManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createReportFile",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportFile";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportRequestId = this.reportRequestId;
    jsonObj.fileUrl = this.fileUrl;
    jsonObj.format = this.format;
    jsonObj.signedUrl = this.signedUrl;
    jsonObj.signedUrlExpiry = this.signedUrlExpiry;
    jsonObj.downloadCount = this.downloadCount;
  }

  readRestParameters(request) {
    this.reportRequestId = request.body?.reportRequestId;
    this.fileUrl = request.body?.fileUrl;
    this.format = request.body?.format;
    this.signedUrl = request.body?.signedUrl;
    this.signedUrlExpiry = request.body?.signedUrlExpiry;
    this.downloadCount = request.body?.downloadCount;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportRequestId = request.mcpParams.reportRequestId;
    this.fileUrl = request.mcpParams.fileUrl;
    this.format = request.mcpParams.format;
    this.signedUrl = request.mcpParams.signedUrl;
    this.signedUrlExpiry = request.mcpParams.signedUrlExpiry;
    this.downloadCount = request.mcpParams.downloadCount;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.reportRequestId == null) {
      throw new BadRequestError("errMsg_reportRequestIdisRequired");
    }

    if (this.fileUrl == null) {
      throw new BadRequestError("errMsg_fileUrlisRequired");
    }

    if (this.format == null) {
      throw new BadRequestError("errMsg_formatisRequired");
    }

    if (this.downloadCount == null) {
      throw new BadRequestError("errMsg_downloadCountisRequired");
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

    this.isOwner = this.reportFile?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateReportfile function to create the reportfile and return the result to the controller
    const reportfile = await dbCreateReportfile(this);

    return reportfile;
  }

  async raiseEvent() {
    ReportfileCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.reportFileId = this.id;
    if (!this.reportFileId) this.reportFileId = newUUID(false);

    const dataClause = {
      id: this.reportFileId,
      reportRequestId: this.reportRequestId,
      fileUrl: this.fileUrl,
      format: this.format,
      signedUrl: this.signedUrl,
      signedUrlExpiry: this.signedUrlExpiry,
      downloadCount: this.downloadCount,
    };

    return dataClause;
  }
}

module.exports = CreateReportFileManager;
