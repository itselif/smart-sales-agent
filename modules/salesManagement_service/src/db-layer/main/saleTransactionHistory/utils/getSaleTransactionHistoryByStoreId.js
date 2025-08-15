const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");

const getSaleTransactionHistoryByStoreId = async (storeId) => {
  try {
    const saleTransactionHistory = await SaleTransactionHistory.findOne({
      where: {
        storeId: storeId,
        isActive: true,
      },
    });

    if (!saleTransactionHistory) {
      return null;
    }
    return saleTransactionHistory.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionHistoryByStoreId",
      err,
    );
  }
};

module.exports = getSaleTransactionHistoryByStoreId;
