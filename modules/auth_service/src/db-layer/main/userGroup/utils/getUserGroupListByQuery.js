const { HttpServerError, BadRequestError } = require("common");

const { UserGroup } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getUserGroupListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const userGroup = await UserGroup.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!userGroup || userGroup.length === 0) return [];

    //      if (!userGroup || userGroup.length === 0) {
    //      throw new NotFoundError(
    //      `UserGroup with the specified criteria not found`
    //  );
    //}

    return userGroup.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupListByQuery",
      err,
    );
  }
};

module.exports = getUserGroupListByQuery;
