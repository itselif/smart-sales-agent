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

const { User, UserGroup, UserGroupMember, Store } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

const { StoreEntityCache } = require("./entity-cache-classes");

class DbGetStorebycodenameCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, Store);
    this.commandName = "dbGetStorebycodename";
    this.nullResult = false;
    this.objectName = "store";
    this.serviceLabel = "salesai-auth-service";
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

  createEntityCacher() {
    super.createEntityCacher();
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

const dbGetStorebycodename = (input) => {
  input.id = input.storeId;
  const dbGetCommand = new DbGetStorebycodenameCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetStorebycodename;
