const { HttpServerError, BadRequestError } = require("common");

const { Store } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getStoreByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const store = await Store.findOne({
      where: { ...query, isActive: true },
    });

    if (!store) return null;
    return store.getData();
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenRequestingStoreByQuery", err);
  }
};

module.exports = getStoreByQuery;
