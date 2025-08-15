const { HttpServerError } = require("common");

const { InventoryItem } = require("models");
const { Op } = require("sequelize");

const updateInventoryItemByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await InventoryItem.update(dataClause, options);
    const inventoryItemIdList = rows.map((item) => item.id);
    return inventoryItemIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingInventoryItemByIdList",
      err,
    );
  }
};

module.exports = updateInventoryItemByIdList;
