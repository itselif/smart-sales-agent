const ReportFileManager = require("./ReportFileManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { ReportfileDeletedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteReportfile } = require("dbLayer");

class DeleteReportFileManager extends ReportFileManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteReportFile",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportFile";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportFileId = this.reportFileId;
  }

  readRestParameters(request) {
    this.reportFileId = request.params?.reportFileId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportFileId = request.mcpParams.reportFileId;
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
    // make an awaited call to the dbDeleteReportfile function to delete the reportfile and return the result to the controller
    const reportfile = await dbDeleteReportfile(this);

    return reportfile;
  }

  async raiseEvent() {
    ReportfileDeletedPublisher.Publish(this.output, this.session).catch(
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
}

module.exports = DeleteReportFileManager;
