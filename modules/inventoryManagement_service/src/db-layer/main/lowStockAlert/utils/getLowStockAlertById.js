const { HttpServerError } = require("common");

let { LowStockAlert } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getLowStockAlertById = async (lowStockAlertId) => {
  try {
    const lowStockAlert = Array.isArray(lowStockAlertId)
      ? await LowStockAlert.findAll({
          where: {
            id: { [Op.in]: lowStockAlertId },
            isActive: true,
          },
        })
      : await LowStockAlert.findOne({
          where: {
            id: lowStockAlertId,
            isActive: true,
          },
        });

    if (!lowStockAlert) {
      return null;
    }
    return Array.isArray(lowStockAlertId)
      ? lowStockAlert.map((item) => item.getData())
      : lowStockAlert.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingLowStockAlertById",
      err,
    );
  }
};

module.exports = getLowStockAlertById;
