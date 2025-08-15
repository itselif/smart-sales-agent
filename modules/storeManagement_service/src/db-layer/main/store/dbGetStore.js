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

const { Store, StoreAssignment } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

class DbGetStoreCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, Store);
    this.commandName = "dbGetStore";
    this.nullResult = false;
    this.objectName = "store";
    this.serviceLabel = "salesai-storemanagement-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (Store.getCqrsJoins) await Store.getCqrsJoins(data);
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

const dbGetStore = (input) => {
  input.id = input.storeId;
  const dbGetCommand = new DbGetStoreCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetStore;
