const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { AnomalyEvent } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { AnomalyEventQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getAnomalyEventById = require("./utils/getAnomalyEventById");

class DbCreateAnomalyeventCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateAnomalyevent";
    this.objectName = "anomalyEvent";
    this.serviceLabel = "salesai-observability-service";
    this.dbEvent =
      "salesai1-observability-service-dbevent-anomalyevent-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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

  // should i add hooksDbLayer here?

  // ask about this should i rename the whereClause to dataClause???

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let anomalyEvent = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        anomalyType: this.dataClause.anomalyType,
        detectedAt: this.dataClause.detectedAt,
        status: this.dataClause.status,
      };

      anomalyEvent =
        anomalyEvent || (await AnomalyEvent.findOne({ where: whereClause }));

      if (anomalyEvent) {
        delete this.dataClause.id;
        this.dataClause.isActive = true;
        if (!updated) await anomalyEvent.update(this.dataClause);
        updated = true;
      }

      if (!updated && this.dataClause.id && !exists) {
        anomalyEvent =
          anomalyEvent || (await AnomalyEvent.findByPk(this.dataClause.id));
        if (anomalyEvent) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await anomalyEvent.update(this.dataClause);
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
        "Error in checking unique index when creating AnomalyEvent",
        eDetail,
      );
    }

    if (!updated && !exists) {
      anomalyEvent = await AnomalyEvent.create(this.dataClause);
    }

    this.dbData = anomalyEvent.getData();
    this.input.anomalyEvent = this.dbData;
    await this.create_childs();
  }
}

const dbCreateAnomalyevent = async (input) => {
  const dbCreateCommand = new DbCreateAnomalyeventCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateAnomalyevent;
