const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetSaletransactionhistory: require("./dbGetSaletransactionhistory"),
  dbCreateSaletransactionhistory: require("./dbCreateSaletransactionhistory"),
  dbDeleteSaletransactionhistory: require("./dbDeleteSaletransactionhistory"),
  dbListSaletransactionhistories: require("./dbListSaletransactionhistories"),
  createSaleTransactionHistory: utils.createSaleTransactionHistory,
  getIdListOfSaleTransactionHistoryByField:
    utils.getIdListOfSaleTransactionHistoryByField,
  getSaleTransactionHistoryById: utils.getSaleTransactionHistoryById,
  getSaleTransactionHistoryAggById: utils.getSaleTransactionHistoryAggById,
  getSaleTransactionHistoryListByQuery:
    utils.getSaleTransactionHistoryListByQuery,
  getSaleTransactionHistoryStatsByQuery:
    utils.getSaleTransactionHistoryStatsByQuery,
  getSaleTransactionHistoryByQuery: utils.getSaleTransactionHistoryByQuery,
  updateSaleTransactionHistoryById: utils.updateSaleTransactionHistoryById,
  updateSaleTransactionHistoryByIdList:
    utils.updateSaleTransactionHistoryByIdList,
  updateSaleTransactionHistoryByQuery:
    utils.updateSaleTransactionHistoryByQuery,
  deleteSaleTransactionHistoryById: utils.deleteSaleTransactionHistoryById,
  deleteSaleTransactionHistoryByQuery:
    utils.deleteSaleTransactionHistoryByQuery,
  getSaleTransactionHistoryByStoreId: utils.getSaleTransactionHistoryByStoreId,
};
