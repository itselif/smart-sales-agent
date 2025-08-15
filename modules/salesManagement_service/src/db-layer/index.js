const mainFunctions = require("./main");

module.exports = {
  // main Database
  // SaleTransaction Db Object
  dbGetSaletransaction: mainFunctions.dbGetSaletransaction,
  dbCreateSaletransaction: mainFunctions.dbCreateSaletransaction,
  dbUpdateSaletransaction: mainFunctions.dbUpdateSaletransaction,
  dbDeleteSaletransaction: mainFunctions.dbDeleteSaletransaction,
  dbListSaletransactions: mainFunctions.dbListSaletransactions,
  createSaleTransaction: mainFunctions.createSaleTransaction,
  getIdListOfSaleTransactionByField:
    mainFunctions.getIdListOfSaleTransactionByField,
  getSaleTransactionById: mainFunctions.getSaleTransactionById,
  getSaleTransactionAggById: mainFunctions.getSaleTransactionAggById,
  getSaleTransactionListByQuery: mainFunctions.getSaleTransactionListByQuery,
  getSaleTransactionStatsByQuery: mainFunctions.getSaleTransactionStatsByQuery,
  getSaleTransactionByQuery: mainFunctions.getSaleTransactionByQuery,
  updateSaleTransactionById: mainFunctions.updateSaleTransactionById,
  updateSaleTransactionByIdList: mainFunctions.updateSaleTransactionByIdList,
  updateSaleTransactionByQuery: mainFunctions.updateSaleTransactionByQuery,
  deleteSaleTransactionById: mainFunctions.deleteSaleTransactionById,
  deleteSaleTransactionByQuery: mainFunctions.deleteSaleTransactionByQuery,
  getSaleTransactionByStoreId: mainFunctions.getSaleTransactionByStoreId,

  // SaleTransactionHistory Db Object
  dbGetSaletransactionhistory: mainFunctions.dbGetSaletransactionhistory,
  dbCreateSaletransactionhistory: mainFunctions.dbCreateSaletransactionhistory,
  dbDeleteSaletransactionhistory: mainFunctions.dbDeleteSaletransactionhistory,
  dbListSaletransactionhistories: mainFunctions.dbListSaletransactionhistories,
  createSaleTransactionHistory: mainFunctions.createSaleTransactionHistory,
  getIdListOfSaleTransactionHistoryByField:
    mainFunctions.getIdListOfSaleTransactionHistoryByField,
  getSaleTransactionHistoryById: mainFunctions.getSaleTransactionHistoryById,
  getSaleTransactionHistoryAggById:
    mainFunctions.getSaleTransactionHistoryAggById,
  getSaleTransactionHistoryListByQuery:
    mainFunctions.getSaleTransactionHistoryListByQuery,
  getSaleTransactionHistoryStatsByQuery:
    mainFunctions.getSaleTransactionHistoryStatsByQuery,
  getSaleTransactionHistoryByQuery:
    mainFunctions.getSaleTransactionHistoryByQuery,
  updateSaleTransactionHistoryById:
    mainFunctions.updateSaleTransactionHistoryById,
  updateSaleTransactionHistoryByIdList:
    mainFunctions.updateSaleTransactionHistoryByIdList,
  updateSaleTransactionHistoryByQuery:
    mainFunctions.updateSaleTransactionHistoryByQuery,
  deleteSaleTransactionHistoryById:
    mainFunctions.deleteSaleTransactionHistoryById,
  deleteSaleTransactionHistoryByQuery:
    mainFunctions.deleteSaleTransactionHistoryByQuery,
  getSaleTransactionHistoryByStoreId:
    mainFunctions.getSaleTransactionHistoryByStoreId,
};
