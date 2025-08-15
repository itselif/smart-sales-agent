const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");
const { Op } = require("sequelize");

const getInventoryMovementAggById = async (inventoryMovementId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const inventoryMovement = Array.isArray(inventoryMovementId)
      ? await InventoryMovement.findAll({
          where: {
            id: { [Op.in]: inventoryMovementId },
            isActive: true,
          },
          include: includes,
        })
      : await InventoryMovement.findOne({
          where: {
            id: inventoryMovementId,
            isActive: true,
          },
          include: includes,
        });

    if (!inventoryMovement) {
      return null;
    }

    const inventoryMovementData =
      Array.isArray(inventoryMovementId) && inventoryMovementId.length > 0
        ? inventoryMovement.map((item) => item.getData())
        : inventoryMovement.getData();
    await InventoryMovement.getCqrsJoins(inventoryMovementData);
    return inventoryMovementData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryMovementAggById",
      err,
    );
  }
};

module.exports = getInventoryMovementAggById;
