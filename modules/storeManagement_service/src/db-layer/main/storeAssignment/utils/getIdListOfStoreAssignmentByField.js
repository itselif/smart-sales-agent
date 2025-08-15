const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { StoreAssignment } = require("models");
const { Op } = require("sequelize");

const getIdListOfStoreAssignmentByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const storeAssignmentProperties = [
      "id",
      "userId",
      "storeId",
      "role",
      "assignmentType",
      "status",
      "overrideJustification",
      "validFrom",
      "validUntil",
    ];

    isValidField = storeAssignmentProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof StoreAssignment[fieldName];

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

    let storeAssignmentIdList = await StoreAssignment.findAll(options);

    if (!storeAssignmentIdList || storeAssignmentIdList.length === 0) {
      throw new NotFoundError(
        `StoreAssignment with the specified criteria not found`,
      );
    }

    storeAssignmentIdList = storeAssignmentIdList.map((item) => item.id);
    return storeAssignmentIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreAssignmentIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfStoreAssignmentByField;
