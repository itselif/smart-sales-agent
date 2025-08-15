const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");
const { Op } = require("sequelize");

const getInventoryItemAggById = async (inventoryItemId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const inventoryItem = Array.isArray(inventoryItemId)
      ? await InventoryItem.findAll({
          where: {
            id: { [Op.in]: inventoryItemId },
            isActive: true,
          },
          include: includes,
        })
      : await InventoryItem.findOne({
          where: {
            id: inventoryItemId,
            isActive: true,
          },
          include: includes,
        });

    if (!inventoryItem) {
      return null;
    }

    const inventoryItemData =
      Array.isArray(inventoryItemId) && inventoryItemId.length > 0
        ? inventoryItem.map((item) => item.getData())
        : inventoryItem.getData();
    await InventoryItem.getCqrsJoins(inventoryItemData);
    return inventoryItemData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryItemAggById",
      err,
    );
  }
};

module.exports = getInventoryItemAggById;
