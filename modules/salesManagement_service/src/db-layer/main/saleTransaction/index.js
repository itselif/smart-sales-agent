const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetSaletransaction: require("./dbGetSaletransaction"),
  dbCreateSaletransaction: require("./dbCreateSaletransaction"),
  dbUpdateSaletransaction: require("./dbUpdateSaletransaction"),
  dbDeleteSaletransaction: require("./dbDeleteSaletransaction"),
  dbListSaletransactions: require("./dbListSaletransactions"),
  createSaleTransaction: utils.createSaleTransaction,
  getIdListOfSaleTransactionByField: utils.getIdListOfSaleTransactionByField,
  getSaleTransactionById: utils.getSaleTransactionById,
  getSaleTransactionAggById: utils.getSaleTransactionAggById,
  getSaleTransactionListByQuery: utils.getSaleTransactionListByQuery,
  getSaleTransactionStatsByQuery: utils.getSaleTransactionStatsByQuery,
  getSaleTransactionByQuery: utils.getSaleTransactionByQuery,
  updateSaleTransactionById: utils.updateSaleTransactionById,
  updateSaleTransactionByIdList: utils.updateSaleTransactionByIdList,
  updateSaleTransactionByQuery: utils.updateSaleTransactionByQuery,
  deleteSaleTransactionById: utils.deleteSaleTransactionById,
  deleteSaleTransactionByQuery: utils.deleteSaleTransactionByQuery,
  getSaleTransactionByStoreId: utils.getSaleTransactionByStoreId,
};
