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

const { ReportRequestQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getReportRequestById = require("./utils/getReportRequestById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateReportrequestCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, ReportRequest, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateReportrequest";
    this.nullResult = false;
    this.objectName = "reportRequest";
    this.serviceLabel = "salesai-reporting-service";
    this.joinedCriteria = false;
    this.dbEvent = "salesai1-reporting-service-dbevent-reportrequest-updated";
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

const dbUpdateReportrequest = async (input) => {
  input.id = input.reportRequestId;
  const dbUpdateCommand = new DbUpdateReportrequestCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateReportrequest;
