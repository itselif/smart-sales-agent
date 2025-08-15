const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { InventoryMovement } = require("models");
const { Op } = require("sequelize");

const getInventoryMovementByStoreId = async (storeId) => {
  try {
    const inventoryMovement = await InventoryMovement.findOne({
      where: {
        storeId: storeId,
        isActive: true,
      },
    });

    if (!inventoryMovement) {
      return null;
    }
    return inventoryMovement.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryMovementByStoreId",
      err,
    );
  }
};

module.exports = getInventoryMovementByStoreId;
