const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");
const { Op } = require("sequelize");

const getLowStockAlertAggById = async (lowStockAlertId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const lowStockAlert = Array.isArray(lowStockAlertId)
      ? await LowStockAlert.findAll({
          where: {
            id: { [Op.in]: lowStockAlertId },
            isActive: true,
          },
          include: includes,
        })
      : await LowStockAlert.findOne({
          where: {
            id: lowStockAlertId,
            isActive: true,
          },
          include: includes,
        });

    if (!lowStockAlert) {
      return null;
    }

    const lowStockAlertData =
      Array.isArray(lowStockAlertId) && lowStockAlertId.length > 0
        ? lowStockAlert.map((item) => item.getData())
        : lowStockAlert.getData();
    await LowStockAlert.getCqrsJoins(lowStockAlertData);
    return lowStockAlertData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingLowStockAlertAggById",
      err,
    );
  }
};

module.exports = getLowStockAlertAggById;
