const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbCreateStore: require("./dbCreateStore"),
  dbGetStore: require("./dbGetStore"),
  dbGetStorebycodename: require("./dbGetStorebycodename"),
  dbListRegisteredstores: require("./dbListRegisteredstores"),
  createStore: utils.createStore,
  getIdListOfStoreByField: utils.getIdListOfStoreByField,
  getStoreById: utils.getStoreById,
  getStoreAggById: utils.getStoreAggById,
  getStoreListByQuery: utils.getStoreListByQuery,
  getStoreStatsByQuery: utils.getStoreStatsByQuery,
  getStoreByQuery: utils.getStoreByQuery,
  updateStoreById: utils.updateStoreById,
  updateStoreByIdList: utils.updateStoreByIdList,
  updateStoreByQuery: utils.updateStoreByQuery,
  deleteStoreById: utils.deleteStoreById,
  deleteStoreByQuery: utils.deleteStoreByQuery,
  getNextCodenameForStore: utils.getNextCodenameForStore,
  getStoreByOwnerId: utils.getStoreByOwnerId,
};
