const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { Store } = require("models");
const { Op } = require("sequelize");

const getStoreByOwnerId = async (ownerId) => {
  try {
    const store = await Store.findOne({
      where: {
        ownerId: ownerId,
        isActive: true,
      },
    });

    if (!store) {
      return null;
    }
    return store.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreByOwnerId",
      err,
    );
  }
};

module.exports = getStoreByOwnerId;
