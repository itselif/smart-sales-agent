const { HttpServerError, BadRequestError } = require("common");

const { UserGroupMember } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getUserGroupMemberByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const userGroupMember = await UserGroupMember.findOne({
      where: { ...query, isActive: true },
    });

    if (!userGroupMember) return null;
    return userGroupMember.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupMemberByQuery",
      err,
    );
  }
};

module.exports = getUserGroupMemberByQuery;
