const { HttpServerError, BadRequestError } = require("common");

const { Store } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getStoreListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const store = await Store.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!store || store.length === 0) return [];

    //      if (!store || store.length === 0) {
    //      throw new NotFoundError(
    //      `Store with the specified criteria not found`
    //  );
    //}

    return store.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreListByQuery",
      err,
    );
  }
};

module.exports = getStoreListByQuery;
