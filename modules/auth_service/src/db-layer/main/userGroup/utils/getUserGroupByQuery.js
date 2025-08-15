const { HttpServerError, BadRequestError } = require("common");

const { UserGroup } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getUserGroupByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const userGroup = await UserGroup.findOne({
      where: { ...query, isActive: true },
    });

    if (!userGroup) return null;
    return userGroup.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingUserGroupByQuery",
      err,
    );
  }
};

module.exports = getUserGroupByQuery;
