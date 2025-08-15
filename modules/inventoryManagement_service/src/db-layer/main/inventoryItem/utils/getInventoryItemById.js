const { HttpServerError } = require("common");

let { InventoryItem } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getInventoryItemById = async (inventoryItemId) => {
  try {
    const inventoryItem = Array.isArray(inventoryItemId)
      ? await InventoryItem.findAll({
          where: {
            id: { [Op.in]: inventoryItemId },
            isActive: true,
          },
        })
      : await InventoryItem.findOne({
          where: {
            id: inventoryItemId,
            isActive: true,
          },
        });

    if (!inventoryItem) {
      return null;
    }
    return Array.isArray(inventoryItemId)
      ? inventoryItem.map((item) => item.getData())
      : inventoryItem.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryItemById",
      err,
    );
  }
};

module.exports = getInventoryItemById;
