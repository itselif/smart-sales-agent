const { HttpServerError } = require("common");

const { SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");

const updateSaleTransactionHistoryByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await SaleTransactionHistory.update(
      dataClause,
      options,
    );
    const saleTransactionHistoryIdList = rows.map((item) => item.id);
    return saleTransactionHistoryIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingSaleTransactionHistoryByIdList",
      err,
    );
  }
};

module.exports = updateSaleTransactionHistoryByIdList;
