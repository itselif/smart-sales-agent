const { HttpServerError } = require("common");

let { SaleTransactionHistory } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getSaleTransactionHistoryById = async (saleTransactionHistoryId) => {
  try {
    const saleTransactionHistory = Array.isArray(saleTransactionHistoryId)
      ? await SaleTransactionHistory.findAll({
          where: {
            id: { [Op.in]: saleTransactionHistoryId },
            isActive: true,
          },
        })
      : await SaleTransactionHistory.findOne({
          where: {
            id: saleTransactionHistoryId,
            isActive: true,
          },
        });

    if (!saleTransactionHistory) {
      return null;
    }
    return Array.isArray(saleTransactionHistoryId)
      ? saleTransactionHistory.map((item) => item.getData())
      : saleTransactionHistory.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionHistoryById",
      err,
    );
  }
};

module.exports = getSaleTransactionHistoryById;
