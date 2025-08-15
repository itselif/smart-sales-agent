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
const { dbGetMetricdatapoint } = require("dbLayer");

class GetMetricDatapointManager extends MetricDatapointManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getMetricDatapoint",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "metricDatapoint";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.metricDatapointId = this.metricDatapointId;
  }

  readRestParameters(request) {
    this.metricDatapointId = request.params?.metricDatapointId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.metricDatapointId = request.mcpParams.metricDatapointId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

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
    // make an awaited call to the dbGetMetricdatapoint function to get the metricdatapoint and return the result to the controller
    const metricdatapoint = await dbGetMetricdatapoint(this);

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
}

module.exports = GetMetricDatapointManager;
