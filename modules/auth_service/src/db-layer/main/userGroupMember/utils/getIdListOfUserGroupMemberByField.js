const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { UserGroupMember } = require("models");
const { Op } = require("sequelize");

const getIdListOfUserGroupMemberByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const userGroupMemberProperties = ["id", "groupId", "userId", "ownerId"];

    isValidField = userGroupMemberProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof UserGroupMember[fieldName];

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

    let userGroupMemberIdList = await UserGroupMember.findAll(options);

    if (!userGroupMemberIdList || userGroupMemberIdList.length === 0) {
      throw new NotFoundError(
        `UserGroupMember with the specified criteria not found`,
      );
    }

    userGroupMemberIdList = userGroupMemberIdList.map((item) => item.id);
    return userGroupMemberIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupMemberIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfUserGroupMemberByField;
