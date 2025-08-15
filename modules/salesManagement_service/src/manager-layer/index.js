module.exports = {
  SalesManagementServiceManager: require("./service-manager/SalesManagementServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // SaleTransaction Db Object
  GetSaleTransactionManager: require("./main/saleTransaction/get-saletransaction"),
  CreateSaleTransactionManager: require("./main/saleTransaction/create-saletransaction"),
  UpdateSaleTransactionManager: require("./main/saleTransaction/update-saletransaction"),
  DeleteSaleTransactionManager: require("./main/saleTransaction/delete-saletransaction"),
  ListSaleTransactionsManager: require("./main/saleTransaction/list-saletransactions"),
  // SaleTransactionHistory Db Object
  GetSaleTransactionHistoryManager: require("./main/saleTransactionHistory/get-saletransactionhistory"),
  CreateSaleTransactionHistoryManager: require("./main/saleTransactionHistory/create-saletransactionhistory"),
  DeleteSaleTransactionHistoryManager: require("./main/saleTransactionHistory/delete-saletransactionhistory"),
  ListSaleTransactionHistoriesManager: require("./main/saleTransactionHistory/list-saletransactionhistories"),
};
