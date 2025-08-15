const ReportPolicyManager = require("./ReportPolicyManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  ReportpolicyCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateReportpolicy } = require("dbLayer");

class CreateReportPolicyManager extends ReportPolicyManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createReportPolicy",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportPolicy";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportType = this.reportType;
    jsonObj.maxRetentionDays = this.maxRetentionDays;
    jsonObj.allowedFormats = this.allowedFormats;
    jsonObj.description = this.description;
  }

  readRestParameters(request) {
    this.reportType = request.body?.reportType;
    this.maxRetentionDays = request.body?.maxRetentionDays;
    this.allowedFormats = request.body?.allowedFormats;
    this.description = request.body?.description;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportType = request.mcpParams.reportType;
    this.maxRetentionDays = request.mcpParams.maxRetentionDays;
    this.allowedFormats = request.mcpParams.allowedFormats;
    this.description = request.mcpParams.description;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.reportType == null) {
      throw new BadRequestError("errMsg_reportTypeisRequired");
    }

    if (this.maxRetentionDays == null) {
      throw new BadRequestError("errMsg_maxRetentionDaysisRequired");
    }

    if (this.allowedFormats == null) {
      throw new BadRequestError("errMsg_allowedFormatsisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.reportPolicy?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateReportpolicy function to create the reportpolicy and return the result to the controller
    const reportpolicy = await dbCreateReportpolicy(this);

    return reportpolicy;
  }

  async raiseEvent() {
    ReportpolicyCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.reportPolicyId = this.id;
    if (!this.reportPolicyId) this.reportPolicyId = newUUID(false);

    const dataClause = {
      id: this.reportPolicyId,
      reportType: this.reportType,
      maxRetentionDays: this.maxRetentionDays,
      allowedFormats: this.allowedFormats,
      description: this.description,
    };

    return dataClause;
  }
}

module.exports = CreateReportPolicyManager;
