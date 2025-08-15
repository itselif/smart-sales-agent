const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { ReportFile } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { ReportFileQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getReportFileById = require("./utils/getReportFileById");

class DbCreateReportfileCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateReportfile";
    this.objectName = "reportFile";
    this.serviceLabel = "salesai-reporting-service";
    this.dbEvent = "salesai1-reporting-service-dbevent-reportfile-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new ReportFileQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "reportFile",
      this.session,
      this.requestId,
    );
    const dbData = await getReportFileById(this.dbData.id);
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

    let reportFile = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        reportFile =
          reportFile || (await ReportFile.findByPk(this.dataClause.id));
        if (reportFile) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await reportFile.update(this.dataClause);
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
        "Error in checking unique index when creating ReportFile",
        eDetail,
      );
    }

    if (!updated && !exists) {
      reportFile = await ReportFile.create(this.dataClause);
    }

    this.dbData = reportFile.getData();
    this.input.reportFile = this.dbData;
    await this.create_childs();
  }
}

const dbCreateReportfile = async (input) => {
  const dbCreateCommand = new DbCreateReportfileCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateReportfile;
