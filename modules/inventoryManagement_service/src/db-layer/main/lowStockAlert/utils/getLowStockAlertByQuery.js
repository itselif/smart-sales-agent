const { HttpServerError, BadRequestError } = require("common");

const { LowStockAlert } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getLowStockAlertByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const lowStockAlert = await LowStockAlert.findOne({
      where: { ...query, isActive: true },
    });

    if (!lowStockAlert) return null;
    return lowStockAlert.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingLowStockAlertByQuery",
      err,
    );
  }
};

module.exports = getLowStockAlertByQuery;
