const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Store } = require("models");
const { Op } = require("sequelize");

const getIdListOfStoreByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const storeProperties = [
      "id",
      "name",
      "fullname",
      "city",
      "avatar",
      "active",
    ];

    isValidField = storeProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof Store[fieldName];

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

    let storeIdList = await Store.findAll(options);

    if (!storeIdList || storeIdList.length === 0) {
      throw new NotFoundError(`Store with the specified criteria not found`);
    }

    storeIdList = storeIdList.map((item) => item.id);
    return storeIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfStoreByField;
