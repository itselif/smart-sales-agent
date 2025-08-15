const { HttpServerError } = require("common");

let { UserGroupMember } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getUserGroupMemberById = async (userGroupMemberId) => {
  try {
    const userGroupMember = Array.isArray(userGroupMemberId)
      ? await UserGroupMember.findAll({
          where: {
            id: { [Op.in]: userGroupMemberId },
            isActive: true,
          },
        })
      : await UserGroupMember.findOne({
          where: {
            id: userGroupMemberId,
            isActive: true,
          },
        });

    if (!userGroupMember) {
      return null;
    }
    return Array.isArray(userGroupMemberId)
      ? userGroupMember.map((item) => item.getData())
      : userGroupMember.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupMemberById",
      err,
    );
  }
};

module.exports = getUserGroupMemberById;
