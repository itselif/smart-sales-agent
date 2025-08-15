const { HttpServerError, BadRequestError } = require("common");

const { InventoryItem } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getInventoryItemByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const inventoryItem = await InventoryItem.findOne({
      where: { ...query, isActive: true },
    });

    if (!inventoryItem) return null;
    return inventoryItem.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryItemByQuery",
      err,
    );
  }
};

module.exports = getInventoryItemByQuery;
