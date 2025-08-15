const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { ReportPolicy } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { ReportPolicyQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getReportPolicyById = require("./utils/getReportPolicyById");

class DbCreateReportpolicyCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateReportpolicy";
    this.objectName = "reportPolicy";
    this.serviceLabel = "salesai-reporting-service";
    this.dbEvent = "salesai1-reporting-service-dbevent-reportpolicy-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new ReportPolicyQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "reportPolicy",
      this.session,
      this.requestId,
    );
    const dbData = await getReportPolicyById(this.dbData.id);
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

    let reportPolicy = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        reportPolicy =
          reportPolicy || (await ReportPolicy.findByPk(this.dataClause.id));
        if (reportPolicy) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await reportPolicy.update(this.dataClause);
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
        "Error in checking unique index when creating ReportPolicy",
        eDetail,
      );
    }

    if (!updated && !exists) {
      reportPolicy = await ReportPolicy.create(this.dataClause);
    }

    this.dbData = reportPolicy.getData();
    this.input.reportPolicy = this.dbData;
    await this.create_childs();
  }
}

const dbCreateReportpolicy = async (input) => {
  const dbCreateCommand = new DbCreateReportpolicyCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateReportpolicy;
