const { HttpServerError } = require("common");

let { UserGroup } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getUserGroupById = async (userGroupId) => {
  try {
    const userGroup = Array.isArray(userGroupId)
      ? await UserGroup.findAll({
          where: {
            id: { [Op.in]: userGroupId },
            isActive: true,
          },
        })
      : await UserGroup.findOne({
          where: {
            id: userGroupId,
            isActive: true,
          },
        });

    if (!userGroup) {
      return null;
    }
    return Array.isArray(userGroupId)
      ? userGroup.map((item) => item.getData())
      : userGroup.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError("errMsg_dbErrorWhenRequestingUserGroupById", err);
  }
};

module.exports = getUserGroupById;
