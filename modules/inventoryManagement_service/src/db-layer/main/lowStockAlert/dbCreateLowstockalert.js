const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { LowStockAlert } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { LowStockAlertQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getLowStockAlertById = require("./utils/getLowStockAlertById");

class DbCreateLowstockalertCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateLowstockalert";
    this.objectName = "lowStockAlert";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-lowstockalert-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new LowStockAlertQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "lowStockAlert",
      this.session,
      this.requestId,
    );
    const dbData = await getLowStockAlertById(this.dbData.id);
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

    let lowStockAlert = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        lowStockAlert =
          lowStockAlert || (await LowStockAlert.findByPk(this.dataClause.id));
        if (lowStockAlert) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await lowStockAlert.update(this.dataClause);
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
        "Error in checking unique index when creating LowStockAlert",
        eDetail,
      );
    }

    if (!updated && !exists) {
      lowStockAlert = await LowStockAlert.create(this.dataClause);
    }

    this.dbData = lowStockAlert.getData();
    this.input.lowStockAlert = this.dbData;
    await this.create_childs();
  }
}

const dbCreateLowstockalert = async (input) => {
  const dbCreateCommand = new DbCreateLowstockalertCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateLowstockalert;
