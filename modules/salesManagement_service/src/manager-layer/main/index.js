module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // SaleTransaction Db Object
  GetSaleTransactionManager: require("./saleTransaction/get-saletransaction"),
  CreateSaleTransactionManager: require("./saleTransaction/create-saletransaction"),
  UpdateSaleTransactionManager: require("./saleTransaction/update-saletransaction"),
  DeleteSaleTransactionManager: require("./saleTransaction/delete-saletransaction"),
  ListSaleTransactionsManager: require("./saleTransaction/list-saletransactions"),
  // SaleTransactionHistory Db Object
  GetSaleTransactionHistoryManager: require("./saleTransactionHistory/get-saletransactionhistory"),
  CreateSaleTransactionHistoryManager: require("./saleTransactionHistory/create-saletransactionhistory"),
  DeleteSaleTransactionHistoryManager: require("./saleTransactionHistory/delete-saletransactionhistory"),
  ListSaleTransactionHistoriesManager: require("./saleTransactionHistory/list-saletransactionhistories"),
};
