const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { SaleTransaction } = require("models");
const { Op } = require("sequelize");

const getIdListOfSaleTransactionByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const saleTransactionProperties = [
      "id",
      "sellerId",
      "amount",
      "currency",
      "transactionDate",
      "status",
      "correctionJustification",
      "storeId",
    ];

    isValidField = saleTransactionProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof SaleTransaction[fieldName];

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

    let saleTransactionIdList = await SaleTransaction.findAll(options);

    if (!saleTransactionIdList || saleTransactionIdList.length === 0) {
      throw new NotFoundError(
        `SaleTransaction with the specified criteria not found`,
      );
    }

    saleTransactionIdList = saleTransactionIdList.map((item) => item.id);
    return saleTransactionIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfSaleTransactionByField;
