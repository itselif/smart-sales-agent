const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { OpenApiSchema } = require("models");

class DbListOpenapischemasCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListOpenapischemas";
    this.emptyResult = true;
    this.objectName = "openApiSchemas";
    this.serviceLabel = "salesai-platformadmin-service";
    this.input.pagination = null;
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  // should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    for (const openApiSchema of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (OpenApiSchema.getCqrsJoins) {
      await OpenApiSchema.getCqrsJoins(item);
    }
  }

  getSelectList() {
    const input = this.input;
    return ["version", "description", "schemaJson"];
  }

  async executeQuery() {
    const input = this.input;
    let options = { where: this.whereClause };
    if (input.sortBy) options.order = input.sortBy ?? [["id", "ASC"]];

    options.include = this.buildIncludes();
    if (options.include && options.include.length == 0) options.include = null;

    if (!input.getJoins) {
      options.include = null;
    }

    let openApiSchemas = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    openApiSchemas = await OpenApiSchema.findAll(options);

    return openApiSchemas;
  }
}

const dbListOpenapischemas = (input) => {
  const dbGetListCommand = new DbListOpenapischemasCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListOpenapischemas;
