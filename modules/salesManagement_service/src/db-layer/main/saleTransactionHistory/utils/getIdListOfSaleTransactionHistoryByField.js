const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");

const getIdListOfSaleTransactionHistoryByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const saleTransactionHistoryProperties = [
      "id",
      "transactionId",
      "changeType",
      "changedByUserId",
      "changeTimestamp",
      "correctionJustification",
      "previousData",
      "newData",
      "storeId",
    ];

    isValidField = saleTransactionHistoryProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof SaleTransactionHistory[fieldName];

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

    let saleTransactionHistoryIdList =
      await SaleTransactionHistory.findAll(options);

    if (
      !saleTransactionHistoryIdList ||
      saleTransactionHistoryIdList.length === 0
    ) {
      throw new NotFoundError(
        `SaleTransactionHistory with the specified criteria not found`,
      );
    }

    saleTransactionHistoryIdList = saleTransactionHistoryIdList.map(
      (item) => item.id,
    );
    return saleTransactionHistoryIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionHistoryIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfSaleTransactionHistoryByField;
