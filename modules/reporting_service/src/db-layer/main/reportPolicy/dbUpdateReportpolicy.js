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

const { ReportPolicyQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getReportPolicyById = require("./utils/getReportPolicyById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateReportpolicyCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, ReportPolicy, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateReportpolicy";
    this.nullResult = false;
    this.objectName = "reportPolicy";
    this.serviceLabel = "salesai-reporting-service";
    this.joinedCriteria = false;
    this.dbEvent = "salesai1-reporting-service-dbevent-reportpolicy-updated";
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

const dbUpdateReportpolicy = async (input) => {
  input.id = input.reportPolicyId;
  const dbUpdateCommand = new DbUpdateReportpolicyCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateReportpolicy;
