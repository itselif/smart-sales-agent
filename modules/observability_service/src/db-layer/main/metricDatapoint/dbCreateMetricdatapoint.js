const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { MetricDatapoint } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const {
  MetricDatapointQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getMetricDatapointById = require("./utils/getMetricDatapointById");

class DbCreateMetricdatapointCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateMetricdatapoint";
    this.objectName = "metricDatapoint";
    this.serviceLabel = "salesai-observability-service";
    this.dbEvent =
      "salesai1-observability-service-dbevent-metricdatapoint-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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

  // should i add hooksDbLayer here?

  // ask about this should i rename the whereClause to dataClause???

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let metricDatapoint = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        metricType: this.dataClause.metricType,
        targetType: this.dataClause.targetType,
        targetId: this.dataClause.targetId,
        periodStart: this.dataClause.periodStart,
      };

      metricDatapoint =
        metricDatapoint ||
        (await MetricDatapoint.findOne({ where: whereClause }));

      if (metricDatapoint) {
        delete this.dataClause.id;
        this.dataClause.isActive = true;
        if (!updated) await metricDatapoint.update(this.dataClause);
        updated = true;
      }

      if (!updated && this.dataClause.id && !exists) {
        metricDatapoint =
          metricDatapoint ||
          (await MetricDatapoint.findByPk(this.dataClause.id));
        if (metricDatapoint) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await metricDatapoint.update(this.dataClause);
          updated = true;
        }
      }
    } catch (error) {
      const eDetail = {
        whereClause: this.normalizeSequalizeOps(whereClause),
        dataClause: this.dataClause,
        errorStack: error.stack,
        checkoutResult: this.input.checkoutResult,
      };
      throw new HttpServerError(
        "Error in checking unique index when creating MetricDatapoint",
        eDetail,
      );
    }

    if (!updated && !exists) {
      metricDatapoint = await MetricDatapoint.create(this.dataClause);
    }

    this.dbData = metricDatapoint.getData();
    this.input.metricDatapoint = this.dbData;
    await this.create_childs();
  }
}

const dbCreateMetricdatapoint = async (input) => {
  const dbCreateCommand = new DbCreateMetricdatapointCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateMetricdatapoint;
