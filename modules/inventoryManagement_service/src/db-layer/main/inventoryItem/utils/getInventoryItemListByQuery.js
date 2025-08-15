const { HttpServerError, BadRequestError } = require("common");

const { InventoryItem } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getInventoryItemListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const inventoryItem = await InventoryItem.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!inventoryItem || inventoryItem.length === 0) return [];

    //      if (!inventoryItem || inventoryItem.length === 0) {
    //      throw new NotFoundError(
    //      `InventoryItem with the specified criteria not found`
    //  );
    //}

    return inventoryItem.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryItemListByQuery",
      err,
    );
  }
};

module.exports = getInventoryItemListByQuery;
