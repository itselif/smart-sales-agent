const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { LowStockAlert } = require("models");
const { Op } = require("sequelize");

const getLowStockAlertByStoreId = async (storeId) => {
  try {
    const lowStockAlert = await LowStockAlert.findOne({
      where: {
        storeId: storeId,
        isActive: true,
      },
    });

    if (!lowStockAlert) {
      return null;
    }
    return lowStockAlert.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingLowStockAlertByStoreId",
      err,
    );
  }
};

module.exports = getLowStockAlertByStoreId;
