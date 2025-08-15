const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetLowstockalert: require("./dbGetLowstockalert"),
  dbCreateLowstockalert: require("./dbCreateLowstockalert"),
  dbResolveLowstockalert: require("./dbResolveLowstockalert"),
  dbDeleteLowstockalert: require("./dbDeleteLowstockalert"),
  dbListLowstockalerts: require("./dbListLowstockalerts"),
  createLowStockAlert: utils.createLowStockAlert,
  getIdListOfLowStockAlertByField: utils.getIdListOfLowStockAlertByField,
  getLowStockAlertById: utils.getLowStockAlertById,
  getLowStockAlertAggById: utils.getLowStockAlertAggById,
  getLowStockAlertListByQuery: utils.getLowStockAlertListByQuery,
  getLowStockAlertStatsByQuery: utils.getLowStockAlertStatsByQuery,
  getLowStockAlertByQuery: utils.getLowStockAlertByQuery,
  updateLowStockAlertById: utils.updateLowStockAlertById,
  updateLowStockAlertByIdList: utils.updateLowStockAlertByIdList,
  updateLowStockAlertByQuery: utils.updateLowStockAlertByQuery,
  deleteLowStockAlertById: utils.deleteLowStockAlertById,
  deleteLowStockAlertByQuery: utils.deleteLowStockAlertByQuery,
  getLowStockAlertByStoreId: utils.getLowStockAlertByStoreId,
};
