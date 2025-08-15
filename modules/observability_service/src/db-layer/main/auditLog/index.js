const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetAuditlog: require("./dbGetAuditlog"),
  dbCreateAuditlog: require("./dbCreateAuditlog"),
  dbUpdateAuditlog: require("./dbUpdateAuditlog"),
  dbDeleteAuditlog: require("./dbDeleteAuditlog"),
  dbListAuditlogs: require("./dbListAuditlogs"),
  createAuditLog: utils.createAuditLog,
  getIdListOfAuditLogByField: utils.getIdListOfAuditLogByField,
  getAuditLogById: utils.getAuditLogById,
  getAuditLogAggById: utils.getAuditLogAggById,
  getAuditLogListByQuery: utils.getAuditLogListByQuery,
  getAuditLogStatsByQuery: utils.getAuditLogStatsByQuery,
  getAuditLogByQuery: utils.getAuditLogByQuery,
  updateAuditLogById: utils.updateAuditLogById,
  updateAuditLogByIdList: utils.updateAuditLogByIdList,
  updateAuditLogByQuery: utils.updateAuditLogByQuery,
  deleteAuditLogById: utils.deleteAuditLogById,
  deleteAuditLogByQuery: utils.deleteAuditLogByQuery,
  getAuditLogByStoreId: utils.getAuditLogByStoreId,
};
