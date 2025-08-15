const { HttpServerError, BadRequestError } = require("common");

const { StoreAssignment } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getStoreAssignmentListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const storeAssignment = await StoreAssignment.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!storeAssignment || storeAssignment.length === 0) return [];

    //      if (!storeAssignment || storeAssignment.length === 0) {
    //      throw new NotFoundError(
    //      `StoreAssignment with the specified criteria not found`
    //  );
    //}

    return storeAssignment.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreAssignmentListByQuery",
      err,
    );
  }
};

module.exports = getStoreAssignmentListByQuery;
