const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { SaleTransaction } = require("models");
const { Op } = require("sequelize");

const getSaleTransactionByStoreId = async (storeId) => {
  try {
    const saleTransaction = await SaleTransaction.findOne({
      where: {
        storeId: storeId,
        isActive: true,
      },
    });

    if (!saleTransaction) {
      return null;
    }
    return saleTransaction.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionByStoreId",
      err,
    );
  }
};

module.exports = getSaleTransactionByStoreId;
