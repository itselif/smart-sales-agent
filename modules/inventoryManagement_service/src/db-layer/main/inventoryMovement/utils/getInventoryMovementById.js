const { HttpServerError } = require("common");

let { InventoryMovement } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getInventoryMovementById = async (inventoryMovementId) => {
  try {
    const inventoryMovement = Array.isArray(inventoryMovementId)
      ? await InventoryMovement.findAll({
          where: {
            id: { [Op.in]: inventoryMovementId },
            isActive: true,
          },
        })
      : await InventoryMovement.findOne({
          where: {
            id: inventoryMovementId,
            isActive: true,
          },
        });

    if (!inventoryMovement) {
      return null;
    }
    return Array.isArray(inventoryMovementId)
      ? inventoryMovement.map((item) => item.getData())
      : inventoryMovement.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryMovementById",
      err,
    );
  }
};

module.exports = getInventoryMovementById;
