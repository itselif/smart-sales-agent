const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { ReportRequest, ReportFile, ReportPolicy } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const { ReportFileQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getReportFileById = require("./utils/getReportFileById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateReportfileCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, ReportFile, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateReportfile";
    this.nullResult = false;
    this.objectName = "reportFile";
    this.serviceLabel = "salesai-reporting-service";
    this.joinedCriteria = false;
    this.dbEvent = "salesai1-reporting-service-dbevent-reportfile-updated";
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

const dbUpdateReportfile = async (input) => {
  input.id = input.reportFileId;
  const dbUpdateCommand = new DbUpdateReportfileCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateReportfile;
