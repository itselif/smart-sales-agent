module.exports = (headers) => {
  // SaleTransaction Db Object Rest Api Router
  const saleTransactionMcpRouter = [];
  // getSaleTransaction controller
  saleTransactionMcpRouter.push(require("./get-saletransaction")(headers));
  // createSaleTransaction controller
  saleTransactionMcpRouter.push(require("./create-saletransaction")(headers));
  // updateSaleTransaction controller
  saleTransactionMcpRouter.push(require("./update-saletransaction")(headers));
  // deleteSaleTransaction controller
  saleTransactionMcpRouter.push(require("./delete-saletransaction")(headers));
  // listSaleTransactions controller
  saleTransactionMcpRouter.push(require("./list-saletransactions")(headers));
  return saleTransactionMcpRouter;
};
