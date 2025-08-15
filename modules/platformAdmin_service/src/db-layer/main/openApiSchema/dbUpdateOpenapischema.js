const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { OpenApiSchema } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const { OpenApiSchemaQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getOpenApiSchemaById = require("./utils/getOpenApiSchemaById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateOpenapischemaCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, OpenApiSchema, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateOpenapischema";
    this.nullResult = false;
    this.objectName = "openApiSchema";
    this.serviceLabel = "salesai-platformadmin-service";
    this.joinedCriteria = false;
    this.dbEvent =
      "salesai1-platformadmin-service-dbevent-openapischema-updated";
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
    this.queryCacheInvalidator = new OpenApiSchemaQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "openApiSchema",
      this.session,
      this.requestId,
    );
    const dbData = await getOpenApiSchemaById(this.dbData.id);
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

const dbUpdateOpenapischema = async (input) => {
  input.id = input.openApiSchemaId;
  const dbUpdateCommand = new DbUpdateOpenapischemaCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateOpenapischema;
