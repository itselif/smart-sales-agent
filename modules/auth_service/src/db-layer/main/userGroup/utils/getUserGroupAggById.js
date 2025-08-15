const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { User, UserGroup, UserGroupMember, Store } = require("models");
const { Op } = require("sequelize");

const getUserGroupAggById = async (userGroupId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const userGroup = Array.isArray(userGroupId)
      ? await UserGroup.findAll({
          where: {
            id: { [Op.in]: userGroupId },
            isActive: true,
          },
          include: includes,
        })
      : await UserGroup.findOne({
          where: {
            id: userGroupId,
            isActive: true,
          },
          include: includes,
        });

    if (!userGroup) {
      return null;
    }

    const userGroupData =
      Array.isArray(userGroupId) && userGroupId.length > 0
        ? userGroup.map((item) => item.getData())
        : userGroup.getData();
    await UserGroup.getCqrsJoins(userGroupData);
    return userGroupData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupAggById",
      err,
    );
  }
};

module.exports = getUserGroupAggById;
