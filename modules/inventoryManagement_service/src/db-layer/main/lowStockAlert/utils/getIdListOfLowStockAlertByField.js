const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { LowStockAlert } = require("models");
const { Op } = require("sequelize");

const getIdListOfLowStockAlertByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const lowStockAlertProperties = [
      "id",
      "inventoryItemId",
      "alertType",
      "alertTimestamp",
      "resolved",
      "resolvedByUserId",
      "resolvedTimestamp",
      "storeId",
    ];

    isValidField = lowStockAlertProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof LowStockAlert[fieldName];

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

    let lowStockAlertIdList = await LowStockAlert.findAll(options);

    if (!lowStockAlertIdList || lowStockAlertIdList.length === 0) {
      throw new NotFoundError(
        `LowStockAlert with the specified criteria not found`,
      );
    }

    lowStockAlertIdList = lowStockAlertIdList.map((item) => item.id);
    return lowStockAlertIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingLowStockAlertIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfLowStockAlertByField;
