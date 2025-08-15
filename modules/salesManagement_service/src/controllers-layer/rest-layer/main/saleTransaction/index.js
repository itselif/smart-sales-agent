const express = require("express");

// SaleTransaction Db Object Rest Api Router
const saleTransactionRouter = express.Router();

// add SaleTransaction controllers

// getSaleTransaction controller
saleTransactionRouter.get(
  "/saletransactions/:saleTransactionId",
  require("./get-saletransaction"),
);
// createSaleTransaction controller
saleTransactionRouter.post(
  "/saletransactions",
  require("./create-saletransaction"),
);
// updateSaleTransaction controller
saleTransactionRouter.patch(
  "/saletransactions/:saleTransactionId",
  require("./update-saletransaction"),
);
// deleteSaleTransaction controller
saleTransactionRouter.delete(
  "/saletransactions/:saleTransactionId",
  require("./delete-saletransaction"),
);
// listSaleTransactions controller
saleTransactionRouter.get(
  "/saletransactions",
  require("./list-saletransactions"),
);

module.exports = saleTransactionRouter;
