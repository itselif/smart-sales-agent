const { HttpServerError, BadRequestError } = require("common");

const { LowStockAlert } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getLowStockAlertListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const lowStockAlert = await LowStockAlert.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!lowStockAlert || lowStockAlert.length === 0) return [];

    //      if (!lowStockAlert || lowStockAlert.length === 0) {
    //      throw new NotFoundError(
    //      `LowStockAlert with the specified criteria not found`
    //  );
    //}

    return lowStockAlert.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingLowStockAlertListByQuery",
      err,
    );
  }
};

module.exports = getLowStockAlertListByQuery;
