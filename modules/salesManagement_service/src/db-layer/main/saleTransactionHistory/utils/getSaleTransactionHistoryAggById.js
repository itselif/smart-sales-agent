const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { SaleTransaction, SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");

const getSaleTransactionHistoryAggById = async (saleTransactionHistoryId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const saleTransactionHistory = Array.isArray(saleTransactionHistoryId)
      ? await SaleTransactionHistory.findAll({
          where: {
            id: { [Op.in]: saleTransactionHistoryId },
            isActive: true,
          },
          include: includes,
        })
      : await SaleTransactionHistory.findOne({
          where: {
            id: saleTransactionHistoryId,
            isActive: true,
          },
          include: includes,
        });

    if (!saleTransactionHistory) {
      return null;
    }

    const saleTransactionHistoryData =
      Array.isArray(saleTransactionHistoryId) &&
      saleTransactionHistoryId.length > 0
        ? saleTransactionHistory.map((item) => item.getData())
        : saleTransactionHistory.getData();
    await SaleTransactionHistory.getCqrsJoins(saleTransactionHistoryData);
    return saleTransactionHistoryData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionHistoryAggById",
      err,
    );
  }
};

module.exports = getSaleTransactionHistoryAggById;
