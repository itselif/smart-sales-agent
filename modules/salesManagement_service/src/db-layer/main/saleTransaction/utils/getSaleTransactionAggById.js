const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { SaleTransaction, SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");

const getSaleTransactionAggById = async (saleTransactionId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const saleTransaction = Array.isArray(saleTransactionId)
      ? await SaleTransaction.findAll({
          where: {
            id: { [Op.in]: saleTransactionId },
            isActive: true,
          },
          include: includes,
        })
      : await SaleTransaction.findOne({
          where: {
            id: saleTransactionId,
            isActive: true,
          },
          include: includes,
        });

    if (!saleTransaction) {
      return null;
    }

    const saleTransactionData =
      Array.isArray(saleTransactionId) && saleTransactionId.length > 0
        ? saleTransaction.map((item) => item.getData())
        : saleTransaction.getData();
    await SaleTransaction.getCqrsJoins(saleTransactionData);
    return saleTransactionData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionAggById",
      err,
    );
  }
};

module.exports = getSaleTransactionAggById;
