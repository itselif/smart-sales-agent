const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { UserGroup } = require("models");
const { Op } = require("sequelize");

const getIdListOfUserGroupByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const userGroupProperties = ["id", "groupName", "avatar"];

    isValidField = userGroupProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof UserGroup[fieldName];

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

    let userGroupIdList = await UserGroup.findAll(options);

    if (!userGroupIdList || userGroupIdList.length === 0) {
      throw new NotFoundError(
        `UserGroup with the specified criteria not found`,
      );
    }

    userGroupIdList = userGroupIdList.map((item) => item.id);
    return userGroupIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfUserGroupByField;
