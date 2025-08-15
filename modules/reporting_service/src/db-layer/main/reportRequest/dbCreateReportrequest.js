const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { ReportRequest } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { ReportRequestQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getReportRequestById = require("./utils/getReportRequestById");

class DbCreateReportrequestCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateReportrequest";
    this.objectName = "reportRequest";
    this.serviceLabel = "salesai-reporting-service";
    this.dbEvent = "salesai1-reporting-service-dbevent-reportrequest-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new ReportRequestQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "reportRequest",
      this.session,
      this.requestId,
    );
    const dbData = await getReportRequestById(this.dbData.id);
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

    let reportRequest = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        reportRequest =
          reportRequest || (await ReportRequest.findByPk(this.dataClause.id));
        if (reportRequest) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await reportRequest.update(this.dataClause);
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
        "Error in checking unique index when creating ReportRequest",
        eDetail,
      );
    }

    if (!updated && !exists) {
      reportRequest = await ReportRequest.create(this.dataClause);
    }

    this.dbData = reportRequest.getData();
    this.input.reportRequest = this.dbData;
    await this.create_childs();
  }
}

const dbCreateReportrequest = async (input) => {
  const dbCreateCommand = new DbCreateReportrequestCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateReportrequest;
