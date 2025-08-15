const ReportFileManager = require("./ReportFileManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { ReportfileUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateReportfile } = require("dbLayer");

class UpdateReportFileManager extends ReportFileManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateReportFile",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportFile";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportFileId = this.reportFileId;
    jsonObj.signedUrl = this.signedUrl;
    jsonObj.signedUrlExpiry = this.signedUrlExpiry;
    jsonObj.downloadCount = this.downloadCount;
  }

  readRestParameters(request) {
    this.reportFileId = request.params?.reportFileId;
    this.signedUrl = request.body?.signedUrl;
    this.signedUrlExpiry = request.body?.signedUrlExpiry;
    this.downloadCount = request.body?.downloadCount;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportFileId = request.mcpParams.reportFileId;
    this.signedUrl = request.mcpParams.signedUrl;
    this.signedUrlExpiry = request.mcpParams.signedUrlExpiry;
    this.downloadCount = request.mcpParams.downloadCount;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getReportFileById } = require("dbLayer");
    this.reportFile = await getReportFileById(this.reportFileId);
    if (!this.reportFile) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.reportFileId == null) {
      throw new BadRequestError("errMsg_reportFileIdisRequired");
    }

    // ID
    if (
      this.reportFileId &&
      !isValidObjectId(this.reportFileId) &&
      !isValidUUID(this.reportFileId)
    ) {
      throw new BadRequestError("errMsg_reportFileIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.reportFile?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateReportfile function to update the reportfile and return the result to the controller
    const reportfile = await dbUpdateReportfile(this);

    return reportfile;
  }

  async raiseEvent() {
    ReportfileUpdatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ id: this.reportFileId }, { isActive: true }] };

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
      signedUrl: this.signedUrl,
      signedUrlExpiry: this.signedUrlExpiry,
      downloadCount: this.downloadCount,
    };

    return dataClause;
  }
}

module.exports = UpdateReportFileManager;
