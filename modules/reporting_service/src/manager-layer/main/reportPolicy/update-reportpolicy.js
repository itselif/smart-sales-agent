const ReportPolicyManager = require("./ReportPolicyManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  ReportpolicyUpdatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateReportpolicy } = require("dbLayer");

class UpdateReportPolicyManager extends ReportPolicyManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateReportPolicy",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "reportPolicy";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.reportPolicyId = this.reportPolicyId;
    jsonObj.maxRetentionDays = this.maxRetentionDays;
    jsonObj.allowedFormats = this.allowedFormats;
    jsonObj.description = this.description;
  }

  readRestParameters(request) {
    this.reportPolicyId = request.params?.reportPolicyId;
    this.maxRetentionDays = request.body?.maxRetentionDays;
    this.allowedFormats = request.body?.allowedFormats;
    this.description = request.body?.description;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.reportPolicyId = request.mcpParams.reportPolicyId;
    this.maxRetentionDays = request.mcpParams.maxRetentionDays;
    this.allowedFormats = request.mcpParams.allowedFormats;
    this.description = request.mcpParams.description;
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
    // make an awaited call to the dbUpdateReportpolicy function to update the reportpolicy and return the result to the controller
    const reportpolicy = await dbUpdateReportpolicy(this);

    return reportpolicy;
  }

  async raiseEvent() {
    ReportpolicyUpdatedPublisher.Publish(this.output, this.session).catch(
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

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      maxRetentionDays: this.maxRetentionDays,
      allowedFormats: this.allowedFormats
        ? this.allowedFormats
        : this.allowedFormats_remove
          ? sequelize.fn(
              "array_remove",
              sequelize.col("allowedFormats"),
              this.allowedFormats_remove,
            )
          : this.allowedFormats_append
            ? sequelize.fn(
                "array_append",
                sequelize.col("allowedFormats"),
                this.allowedFormats_append,
              )
            : undefined,
      description: this.description,
    };

    return dataClause;
  }
}

module.exports = UpdateReportPolicyManager;
