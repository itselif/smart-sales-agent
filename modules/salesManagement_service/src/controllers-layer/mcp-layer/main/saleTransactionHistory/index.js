module.exports = (headers) => {
  // SaleTransactionHistory Db Object Rest Api Router
  const saleTransactionHistoryMcpRouter = [];
  // getSaleTransactionHistory controller
  saleTransactionHistoryMcpRouter.push(
    require("./get-saletransactionhistory")(headers),
  );
  // createSaleTransactionHistory controller
  saleTransactionHistoryMcpRouter.push(
    require("./create-saletransactionhistory")(headers),
  );
  // deleteSaleTransactionHistory controller
  saleTransactionHistoryMcpRouter.push(
    require("./delete-saletransactionhistory")(headers),
  );
  // listSaleTransactionHistories controller
  saleTransactionHistoryMcpRouter.push(
    require("./list-saletransactionhistories")(headers),
  );
  return saleTransactionHistoryMcpRouter;
};
