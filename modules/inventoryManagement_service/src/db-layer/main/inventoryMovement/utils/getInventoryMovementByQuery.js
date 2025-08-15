const { HttpServerError, BadRequestError } = require("common");

const { InventoryMovement } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getInventoryMovementByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const inventoryMovement = await InventoryMovement.findOne({
      where: { ...query, isActive: true },
    });

    if (!inventoryMovement) return null;
    return inventoryMovement.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryMovementByQuery",
      err,
    );
  }
};

module.exports = getInventoryMovementByQuery;
