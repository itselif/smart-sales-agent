const MetricDatapointManager = require("./MetricDatapointManager");
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
const { dbCreateMetricdatapoint } = require("dbLayer");

class CreateMetricDatapointManager extends MetricDatapointManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createMetricDatapoint",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "metricDatapoint";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.metricType = this.metricType;
    jsonObj.targetType = this.targetType;
    jsonObj.targetId = this.targetId;
    jsonObj.periodStart = this.periodStart;
    jsonObj.granularity = this.granularity;
    jsonObj.value = this.value;
    jsonObj.flagAnomalous = this.flagAnomalous;
    jsonObj.observedByUserId = this.observedByUserId;
    jsonObj.context = this.context;
  }

  readRestParameters(request) {
    this.metricType = request.body?.metricType;
    this.targetType = request.body?.targetType;
    this.targetId = request.body?.targetId;
    this.periodStart = request.body?.periodStart;
    this.granularity = request.body?.granularity;
    this.value = request.body?.value;
    this.flagAnomalous = request.body?.flagAnomalous;
    this.observedByUserId = request.body?.observedByUserId;
    this.context = request.body?.context;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.metricType = request.mcpParams.metricType;
    this.targetType = request.mcpParams.targetType;
    this.targetId = request.mcpParams.targetId;
    this.periodStart = request.mcpParams.periodStart;
    this.granularity = request.mcpParams.granularity;
    this.value = request.mcpParams.value;
    this.flagAnomalous = request.mcpParams.flagAnomalous;
    this.observedByUserId = request.mcpParams.observedByUserId;
    this.context = request.mcpParams.context;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.metricType == null) {
      throw new BadRequestError("errMsg_metricTypeisRequired");
    }

    if (this.targetType == null) {
      throw new BadRequestError("errMsg_targetTypeisRequired");
    }

    if (this.periodStart == null) {
      throw new BadRequestError("errMsg_periodStartisRequired");
    }

    if (this.granularity == null) {
      throw new BadRequestError("errMsg_granularityisRequired");
    }

    if (this.value == null) {
      throw new BadRequestError("errMsg_valueisRequired");
    }

    // ID
    if (
      this.observedByUserId &&
      !isValidObjectId(this.observedByUserId) &&
      !isValidUUID(this.observedByUserId)
    ) {
      throw new BadRequestError("errMsg_observedByUserIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.metricDatapoint?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateMetricdatapoint function to create the metricdatapoint and return the result to the controller
    const metricdatapoint = await dbCreateMetricdatapoint(this);

    return metricdatapoint;
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.metricDatapointId = this.id;
    if (!this.metricDatapointId) this.metricDatapointId = newUUID(false);

    const dataClause = {
      id: this.metricDatapointId,
      metricType: this.metricType,
      targetType: this.targetType,
      targetId: this.targetId,
      periodStart: this.periodStart,
      granularity: this.granularity,
      value: this.value,
      flagAnomalous: this.flagAnomalous,
      observedByUserId: this.observedByUserId,
      context: this.context
        ? typeof this.context == "string"
          ? JSON.parse(this.context)
          : this.context
        : null,
    };

    return dataClause;
  }
}

module.exports = CreateMetricDatapointManager;
