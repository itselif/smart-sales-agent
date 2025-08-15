const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { User, UserGroup, UserGroupMember, Store } = require("models");
const { Op } = require("sequelize");

const getUserGroupMemberAggById = async (userGroupMemberId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const userGroupMember = Array.isArray(userGroupMemberId)
      ? await UserGroupMember.findAll({
          where: {
            id: { [Op.in]: userGroupMemberId },
            isActive: true,
          },
          include: includes,
        })
      : await UserGroupMember.findOne({
          where: {
            id: userGroupMemberId,
            isActive: true,
          },
          include: includes,
        });

    if (!userGroupMember) {
      return null;
    }

    const userGroupMemberData =
      Array.isArray(userGroupMemberId) && userGroupMemberId.length > 0
        ? userGroupMember.map((item) => item.getData())
        : userGroupMember.getData();
    await UserGroupMember.getCqrsJoins(userGroupMemberData);
    return userGroupMemberData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupMemberAggById",
      err,
    );
  }
};

module.exports = getUserGroupMemberAggById;
