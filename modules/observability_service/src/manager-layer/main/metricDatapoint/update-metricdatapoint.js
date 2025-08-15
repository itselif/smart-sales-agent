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
const { dbUpdateMetricdatapoint } = require("dbLayer");

class UpdateMetricDatapointManager extends MetricDatapointManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateMetricDatapoint",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "metricDatapoint";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.metricDatapointId = this.metricDatapointId;
    jsonObj.value = this.value;
    jsonObj.flagAnomalous = this.flagAnomalous;
    jsonObj.context = this.context;
  }

  readRestParameters(request) {
    this.metricDatapointId = request.params?.metricDatapointId;
    this.value = request.body?.value;
    this.flagAnomalous = request.body?.flagAnomalous;
    this.context = request.body?.context;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.metricDatapointId = request.mcpParams.metricDatapointId;
    this.value = request.mcpParams.value;
    this.flagAnomalous = request.mcpParams.flagAnomalous;
    this.context = request.mcpParams.context;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getMetricDatapointById } = require("dbLayer");
    this.metricDatapoint = await getMetricDatapointById(this.metricDatapointId);
    if (!this.metricDatapoint) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.metricDatapointId == null) {
      throw new BadRequestError("errMsg_metricDatapointIdisRequired");
    }

    // ID
    if (
      this.metricDatapointId &&
      !isValidObjectId(this.metricDatapointId) &&
      !isValidUUID(this.metricDatapointId)
    ) {
      throw new BadRequestError("errMsg_metricDatapointIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.metricDatapoint?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateMetricdatapoint function to update the metricdatapoint and return the result to the controller
    const metricdatapoint = await dbUpdateMetricdatapoint(this);

    return metricdatapoint;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.metricDatapointId }, { isActive: true }] };

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
      value: this.value,
      flagAnomalous: this.flagAnomalous,
      context: this.context
        ? typeof this.context == "string"
          ? JSON.parse(this.context)
          : this.context
        : null,
    };

    return dataClause;
  }
}

module.exports = UpdateMetricDatapointManager;
