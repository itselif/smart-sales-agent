const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { InventoryItem } = require("models");
const { Op } = require("sequelize");

const getIdListOfInventoryItemByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const inventoryItemProperties = [
      "id",
      "productId",
      "quantity",
      "status",
      "lowStockThreshold",
      "lastSyncTimestamp",
      "storeId",
    ];

    isValidField = inventoryItemProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof InventoryItem[fieldName];

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

    let inventoryItemIdList = await InventoryItem.findAll(options);

    if (!inventoryItemIdList || inventoryItemIdList.length === 0) {
      throw new NotFoundError(
        `InventoryItem with the specified criteria not found`,
      );
    }

    inventoryItemIdList = inventoryItemIdList.map((item) => item.id);
    return inventoryItemIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingInventoryItemIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfInventoryItemByField;
