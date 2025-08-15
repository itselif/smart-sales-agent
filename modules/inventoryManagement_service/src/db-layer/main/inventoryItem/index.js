const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetInventoryitem: require("./dbGetInventoryitem"),
  dbCreateInventoryitem: require("./dbCreateInventoryitem"),
  dbUpdateInventoryitem: require("./dbUpdateInventoryitem"),
  dbDeleteInventoryitem: require("./dbDeleteInventoryitem"),
  dbListInventoryitems: require("./dbListInventoryitems"),
  createInventoryItem: utils.createInventoryItem,
  getIdListOfInventoryItemByField: utils.getIdListOfInventoryItemByField,
  getInventoryItemById: utils.getInventoryItemById,
  getInventoryItemAggById: utils.getInventoryItemAggById,
  getInventoryItemListByQuery: utils.getInventoryItemListByQuery,
  getInventoryItemStatsByQuery: utils.getInventoryItemStatsByQuery,
  getInventoryItemByQuery: utils.getInventoryItemByQuery,
  updateInventoryItemById: utils.updateInventoryItemById,
  updateInventoryItemByIdList: utils.updateInventoryItemByIdList,
  updateInventoryItemByQuery: utils.updateInventoryItemByQuery,
  deleteInventoryItemById: utils.deleteInventoryItemById,
  deleteInventoryItemByQuery: utils.deleteInventoryItemByQuery,
  getInventoryItemByStoreId: utils.getInventoryItemByStoreId,
};
