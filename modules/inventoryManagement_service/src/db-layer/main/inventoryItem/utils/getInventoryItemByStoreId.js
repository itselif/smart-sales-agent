const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { InventoryItem } = require("models");
const { Op } = require("sequelize");

const getInventoryItemByStoreId = async (storeId) => {
  try {
    const inventoryItem = await InventoryItem.findOne({
      where: {
        storeId: storeId,
        isActive: true,
      },
    });

    if (!inventoryItem) {
      return null;
    }
    return inventoryItem.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryItemByStoreId",
      err,
    );
  }
};

module.exports = getInventoryItemByStoreId;
