const { HttpServerError } = require("common");

const { InventoryMovement } = require("models");
const { Op } = require("sequelize");

const updateInventoryMovementByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await InventoryMovement.update(dataClause, options);
    const inventoryMovementIdList = rows.map((item) => item.id);
    return inventoryMovementIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingInventoryMovementByIdList",
      err,
    );
  }
};

module.exports = updateInventoryMovementByIdList;
