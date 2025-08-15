const { HttpServerError, BadRequestError } = require("common");

const { StoreAssignment } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getStoreAssignmentByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const storeAssignment = await StoreAssignment.findOne({
      where: { ...query, isActive: true },
    });

    if (!storeAssignment) return null;
    return storeAssignment.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreAssignmentByQuery",
      err,
    );
  }
};

module.exports = getStoreAssignmentByQuery;
