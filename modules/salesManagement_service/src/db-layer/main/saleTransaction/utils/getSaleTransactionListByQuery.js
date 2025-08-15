const { HttpServerError, BadRequestError } = require("common");

const { SaleTransaction } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getSaleTransactionListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const saleTransaction = await SaleTransaction.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!saleTransaction || saleTransaction.length === 0) return [];

    //      if (!saleTransaction || saleTransaction.length === 0) {
    //      throw new NotFoundError(
    //      `SaleTransaction with the specified criteria not found`
    //  );
    //}

    return saleTransaction.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionListByQuery",
      err,
    );
  }
};

module.exports = getSaleTransactionListByQuery;
