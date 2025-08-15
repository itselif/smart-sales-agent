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

const { ReportFileQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteReportfileCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, ReportFile, instanceMode);
    this.commandName = "dbDeleteReportfile";
    this.nullResult = false;
    this.objectName = "reportFile";
    this.serviceLabel = "salesai-reporting-service";
    this.dbEvent = "salesai1-reporting-service-dbevent-reportfile-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
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
    await elasticIndexer.deleteData(this.dbData.id);
  }

  //should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    // transpose dbData
  }
}

const dbDeleteReportfile = async (input) => {
  input.id = input.reportFileId;
  const dbDeleteCommand = new DbDeleteReportfileCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteReportfile;
