const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { InventoryMovement } = require("models");
const { Op } = require("sequelize");

const getIdListOfInventoryMovementByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const inventoryMovementProperties = [
      "id",
      "inventoryItemId",
      "quantityDelta",
      "movementType",
      "movementTimestamp",
      "userId",
      "movementReason",
      "storeId",
    ];

    isValidField = inventoryMovementProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof InventoryMovement[fieldName];

    if (typeof fieldValue !== expectedType) {
      throw new BadRequestError(
        `Invalid field value type for ${fieldName}. Expected ${expectedType}.`,
      );
    }

    const options = {
      where: isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] }, isActive: true }
        : { [fieldName]: fieldValue, isActive: true },
      attributes: ["id"],
    };

    let inventoryMovementIdList = await InventoryMovement.findAll(options);

    if (!inventoryMovementIdList || inventoryMovementIdList.length === 0) {
      throw new NotFoundError(
        `InventoryMovement with the specified criteria not found`,
      );
    }

    inventoryMovementIdList = inventoryMovementIdList.map((item) => item.id);
    return inventoryMovementIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryMovementIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfInventoryMovementByField;
