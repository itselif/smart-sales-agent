const { HttpServerError } = require("common");

const { LowStockAlert } = require("models");
const { Op } = require("sequelize");

const updateLowStockAlertByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await LowStockAlert.update(dataClause, options);
    const lowStockAlertIdList = rows.map((item) => item.id);
    return lowStockAlertIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingLowStockAlertByIdList",
      err,
    );
  }
};

module.exports = updateLowStockAlertByIdList;
