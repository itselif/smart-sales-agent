const { HttpServerError, BadRequestError } = require("common");

const { SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getSaleTransactionHistoryListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const saleTransactionHistory = await SaleTransactionHistory.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!saleTransactionHistory || saleTransactionHistory.length === 0)
      return [];

    //      if (!saleTransactionHistory || saleTransactionHistory.length === 0) {
    //      throw new NotFoundError(
    //      `SaleTransactionHistory with the specified criteria not found`
    //  );
    //}

    return saleTransactionHistory.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionHistoryListByQuery",
      err,
    );
  }
};

module.exports = getSaleTransactionHistoryListByQuery;
