const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetStore: require("./dbGetStore"),
  dbCreateStore: require("./dbCreateStore"),
  dbUpdateStore: require("./dbUpdateStore"),
  dbDeleteStore: require("./dbDeleteStore"),
  dbListStores: require("./dbListStores"),
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
};
