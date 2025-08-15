const { sequelize } = require("common");
const { Op } = require("sequelize");
const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");

const { OpenApiSchema } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

class DbGetOpenapischemaCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, OpenApiSchema);
    this.commandName = "dbGetOpenapischema";
    this.nullResult = false;
    this.objectName = "openApiSchema";
    this.serviceLabel = "salesai-platformadmin-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  getSelectList() {
    const input = this.input;
    return ["version", "description", "schemaJson"];
  }

  async getCqrsJoins(data) {
    if (OpenApiSchema.getCqrsJoins) await OpenApiSchema.getCqrsJoins(data);
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async checkEntityOwnership(entity) {
    return true;
  }

  async transposeResult() {
    // transpose dbData
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbGetOpenapischema = (input) => {
  input.id = input.openApiSchemaId;
  const dbGetCommand = new DbGetOpenapischemaCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetOpenapischema;
