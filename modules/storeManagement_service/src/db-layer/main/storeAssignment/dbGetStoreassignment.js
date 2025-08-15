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

class DbGetStoreassignmentCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, StoreAssignment);
    this.commandName = "dbGetStoreassignment";
    this.nullResult = false;
    this.objectName = "storeAssignment";
    this.serviceLabel = "salesai-storemanagement-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (StoreAssignment.getCqrsJoins) await StoreAssignment.getCqrsJoins(data);
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

const dbGetStoreassignment = (input) => {
  input.id = input.storeAssignmentId;
  const dbGetCommand = new DbGetStoreassignmentCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetStoreassignment;
