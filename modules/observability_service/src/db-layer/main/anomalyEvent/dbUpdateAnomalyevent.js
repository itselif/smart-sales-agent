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

const { AnomalyEventQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getAnomalyEventById = require("./utils/getAnomalyEventById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateAnomalyeventCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, AnomalyEvent, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateAnomalyevent";
    this.nullResult = false;
    this.objectName = "anomalyEvent";
    this.serviceLabel = "salesai-observability-service";
    this.joinedCriteria = false;
    this.dbEvent =
      "salesai1-observability-service-dbevent-anomalyevent-updated";
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
    this.queryCacheInvalidator = new AnomalyEventQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "anomalyEvent",
      this.session,
      this.requestId,
    );
    const dbData = await getAnomalyEventById(this.dbData.id);
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

const dbUpdateAnomalyevent = async (input) => {
  input.id = input.anomalyEventId;
  const dbUpdateCommand = new DbUpdateAnomalyeventCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateAnomalyevent;
