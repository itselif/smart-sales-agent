const { HttpServerError } = require("common");

const { Store } = require("models");
const { Op } = require("sequelize");

const updateStoreByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await Store.update(dataClause, options);
    const storeIdList = rows.map((item) => item.id);
    return storeIdList;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenUpdatingStoreByIdList", err);
  }
};

module.exports = updateStoreByIdList;
