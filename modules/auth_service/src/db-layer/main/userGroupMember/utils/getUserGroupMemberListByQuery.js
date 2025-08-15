const { HttpServerError, BadRequestError } = require("common");

const { UserGroupMember } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getUserGroupMemberListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const userGroupMember = await UserGroupMember.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!userGroupMember || userGroupMember.length === 0) return [];

    //      if (!userGroupMember || userGroupMember.length === 0) {
    //      throw new NotFoundError(
    //      `UserGroupMember with the specified criteria not found`
    //  );
    //}

    return userGroupMember.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupMemberListByQuery",
      err,
    );
  }
};

module.exports = getUserGroupMemberListByQuery;
