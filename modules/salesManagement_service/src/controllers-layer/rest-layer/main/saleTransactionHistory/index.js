const express = require("express");

// SaleTransactionHistory Db Object Rest Api Router
const saleTransactionHistoryRouter = express.Router();

// add SaleTransactionHistory controllers

// getSaleTransactionHistory controller
saleTransactionHistoryRouter.get(
  "/saletransactionhistories/:saleTransactionHistoryId",
  require("./get-saletransactionhistory"),
);
// createSaleTransactionHistory controller
saleTransactionHistoryRouter.post(
  "/saletransactionhistories",
  require("./create-saletransactionhistory"),
);
// deleteSaleTransactionHistory controller
saleTransactionHistoryRouter.delete(
  "/saletransactionhistories/:saleTransactionHistoryId",
  require("./delete-saletransactionhistory"),
);
// listSaleTransactionHistories controller
saleTransactionHistoryRouter.get(
  "/saletransactionhistories",
  require("./list-saletransactionhistories"),
);

module.exports = saleTransactionHistoryRouter;
