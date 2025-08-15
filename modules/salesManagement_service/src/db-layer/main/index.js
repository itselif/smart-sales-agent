const saleTransactionFunctions = require("./saleTransaction");
const saleTransactionHistoryFunctions = require("./saleTransactionHistory");

module.exports = {
  // main Database
  // SaleTransaction Db Object
  dbGetSaletransaction: saleTransactionFunctions.dbGetSaletransaction,
  dbCreateSaletransaction: saleTransactionFunctions.dbCreateSaletransaction,
  dbUpdateSaletransaction: saleTransactionFunctions.dbUpdateSaletransaction,
  dbDeleteSaletransaction: saleTransactionFunctions.dbDeleteSaletransaction,
  dbListSaletransactions: saleTransactionFunctions.dbListSaletransactions,
  createSaleTransaction: saleTransactionFunctions.createSaleTransaction,
  getIdListOfSaleTransactionByField:
    saleTransactionFunctions.getIdListOfSaleTransactionByField,
  getSaleTransactionById: saleTransactionFunctions.getSaleTransactionById,
  getSaleTransactionAggById: saleTransactionFunctions.getSaleTransactionAggById,
  getSaleTransactionListByQuery:
    saleTransactionFunctions.getSaleTransactionListByQuery,
  getSaleTransactionStatsByQuery:
    saleTransactionFunctions.getSaleTransactionStatsByQuery,
  getSaleTransactionByQuery: saleTransactionFunctions.getSaleTransactionByQuery,
  updateSaleTransactionById: saleTransactionFunctions.updateSaleTransactionById,
  updateSaleTransactionByIdList:
    saleTransactionFunctions.updateSaleTransactionByIdList,
  updateSaleTransactionByQuery:
    saleTransactionFunctions.updateSaleTransactionByQuery,
  deleteSaleTransactionById: saleTransactionFunctions.deleteSaleTransactionById,
  deleteSaleTransactionByQuery:
    saleTransactionFunctions.deleteSaleTransactionByQuery,
  getSaleTransactionByStoreId:
    saleTransactionFunctions.getSaleTransactionByStoreId,

  // SaleTransactionHistory Db Object
  dbGetSaletransactionhistory:
    saleTransactionHistoryFunctions.dbGetSaletransactionhistory,
  dbCreateSaletransactionhistory:
    saleTransactionHistoryFunctions.dbCreateSaletransactionhistory,
  dbDeleteSaletransactionhistory:
    saleTransactionHistoryFunctions.dbDeleteSaletransactionhistory,
  dbListSaletransactionhistories:
    saleTransactionHistoryFunctions.dbListSaletransactionhistories,
  createSaleTransactionHistory:
    saleTransactionHistoryFunctions.createSaleTransactionHistory,
  getIdListOfSaleTransactionHistoryByField:
    saleTransactionHistoryFunctions.getIdListOfSaleTransactionHistoryByField,
  getSaleTransactionHistoryById:
    saleTransactionHistoryFunctions.getSaleTransactionHistoryById,
  getSaleTransactionHistoryAggById:
    saleTransactionHistoryFunctions.getSaleTransactionHistoryAggById,
  getSaleTransactionHistoryListByQuery:
    saleTransactionHistoryFunctions.getSaleTransactionHistoryListByQuery,
  getSaleTransactionHistoryStatsByQuery:
    saleTransactionHistoryFunctions.getSaleTransactionHistoryStatsByQuery,
  getSaleTransactionHistoryByQuery:
    saleTransactionHistoryFunctions.getSaleTransactionHistoryByQuery,
  updateSaleTransactionHistoryById:
    saleTransactionHistoryFunctions.updateSaleTransactionHistoryById,
  updateSaleTransactionHistoryByIdList:
    saleTransactionHistoryFunctions.updateSaleTransactionHistoryByIdList,
  updateSaleTransactionHistoryByQuery:
    saleTransactionHistoryFunctions.updateSaleTransactionHistoryByQuery,
  deleteSaleTransactionHistoryById:
    saleTransactionHistoryFunctions.deleteSaleTransactionHistoryById,
  deleteSaleTransactionHistoryByQuery:
    saleTransactionHistoryFunctions.deleteSaleTransactionHistoryByQuery,
  getSaleTransactionHistoryByStoreId:
    saleTransactionHistoryFunctions.getSaleTransactionHistoryByStoreId,
};
