const { HttpServerError, BadRequestError } = require("common");

const { SaleTransaction } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getSaleTransactionByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const saleTransaction = await SaleTransaction.findOne({
      where: { ...query, isActive: true },
    });

    if (!saleTransaction) return null;
    return saleTransaction.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionByQuery",
      err,
    );
  }
};

module.exports = getSaleTransactionByQuery;
