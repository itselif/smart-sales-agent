const { HttpServerError } = require("common");

const { SaleTransaction } = require("models");
const { Op } = require("sequelize");

const updateSaleTransactionByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await SaleTransaction.update(dataClause, options);
    const saleTransactionIdList = rows.map((item) => item.id);
    return saleTransactionIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingSaleTransactionByIdList",
      err,
    );
  }
};

module.exports = updateSaleTransactionByIdList;
