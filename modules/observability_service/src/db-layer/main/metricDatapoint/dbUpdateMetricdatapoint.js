const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { AuditLog, MetricDatapoint, AnomalyEvent } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const {
  MetricDatapointQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getMetricDatapointById = require("./utils/getMetricDatapointById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateMetricdatapointCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, MetricDatapoint, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateMetricdatapoint";
    this.nullResult = false;
    this.objectName = "metricDatapoint";
    this.serviceLabel = "salesai-observability-service";
    this.joinedCriteria = false;
    this.dbEvent =
      "salesai1-observability-service-dbevent-metricdatapoint-updated";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async transposeResult() {
    // transpose dbData
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new MetricDatapointQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "metricDatapoint",
      this.session,
      this.requestId,
    );
    const dbData = await getMetricDatapointById(this.dbData.id);
    await elasticIndexer.indexData(dbData);
  }

  // ask about this should i rename the whereClause to dataClause???

  async setCalculatedFieldsAfterInstance(data) {
    const input = this.input;
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbUpdateMetricdatapoint = async (input) => {
  input.id = input.metricDatapointId;
  const dbUpdateCommand = new DbUpdateMetricdatapointCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateMetricdatapoint;
