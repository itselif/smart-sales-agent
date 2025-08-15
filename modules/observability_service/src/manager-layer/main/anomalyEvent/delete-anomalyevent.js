const AnomalyEventManager = require("./AnomalyEventManager");
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
const { dbDeleteAnomalyevent } = require("dbLayer");

class DeleteAnomalyEventManager extends AnomalyEventManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteAnomalyEvent",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "anomalyEvent";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.anomalyEventId = this.anomalyEventId;
  }

  readRestParameters(request) {
    this.anomalyEventId = request.params?.anomalyEventId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.anomalyEventId = request.mcpParams.anomalyEventId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getAnomalyEventById } = require("dbLayer");
    this.anomalyEvent = await getAnomalyEventById(this.anomalyEventId);
    if (!this.anomalyEvent) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.anomalyEventId == null) {
      throw new BadRequestError("errMsg_anomalyEventIdisRequired");
    }

    // ID
    if (
      this.anomalyEventId &&
      !isValidObjectId(this.anomalyEventId) &&
      !isValidUUID(this.anomalyEventId)
    ) {
      throw new BadRequestError("errMsg_anomalyEventIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.anomalyEvent?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbDeleteAnomalyevent function to delete the anomalyevent and return the result to the controller
    const anomalyevent = await dbDeleteAnomalyevent(this);

    return anomalyevent;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.anomalyEventId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = DeleteAnomalyEventManager;
