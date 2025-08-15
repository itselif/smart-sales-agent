const { HttpServerError, BadRequestError } = require("common");

const { InventoryMovement } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getInventoryMovementListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const inventoryMovement = await InventoryMovement.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!inventoryMovement || inventoryMovement.length === 0) return [];

    //      if (!inventoryMovement || inventoryMovement.length === 0) {
    //      throw new NotFoundError(
    //      `InventoryMovement with the specified criteria not found`
    //  );
    //}

    return inventoryMovement.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryMovementListByQuery",
      err,
    );
  }
};

module.exports = getInventoryMovementListByQuery;
