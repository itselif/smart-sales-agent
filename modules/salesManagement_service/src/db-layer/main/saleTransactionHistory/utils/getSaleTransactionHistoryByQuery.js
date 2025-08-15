const { HttpServerError, BadRequestError } = require("common");

const { SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getSaleTransactionHistoryByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const saleTransactionHistory = await SaleTransactionHistory.findOne({
      where: { ...query, isActive: true },
    });

    if (!saleTransactionHistory) return null;
    return saleTransactionHistory.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionHistoryByQuery",
      err,
    );
  }
};

module.exports = getSaleTransactionHistoryByQuery;
