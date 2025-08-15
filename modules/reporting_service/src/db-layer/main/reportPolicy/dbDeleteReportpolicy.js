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

const { ReportPolicyQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteReportpolicyCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, ReportPolicy, instanceMode);
    this.commandName = "dbDeleteReportpolicy";
    this.nullResult = false;
    this.objectName = "reportPolicy";
    this.serviceLabel = "salesai-reporting-service";
    this.dbEvent = "salesai1-reporting-service-dbevent-reportpolicy-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
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
    await elasticIndexer.deleteData(this.dbData.id);
  }

  //should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    // transpose dbData
  }
}

const dbDeleteReportpolicy = async (input) => {
  input.id = input.reportPolicyId;
  const dbDeleteCommand = new DbDeleteReportpolicyCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteReportpolicy;
